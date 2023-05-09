from amo.models import Airport
from datetime import datetime
import json
from math import radians, cos, sin, asin, sqrt
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
import requests

class MockAirlinesView(APIView):
    def get(self, request):
        self.origin_airport = request.GET.get("origin")
        self.destination_airport = request.GET.get("destination")
        self.departure_date = request.GET.get("departure_date")
        self.return_date = request.GET.get("return_date")

        print("[ *** 0.0 Checking the given informations... *** ]")
        is_something_wrong = self.is_something_wrong()
        if is_something_wrong:
            return Response({"error": is_something_wrong}, status=status.HTTP_400_BAD_REQUEST)
        
        print("[ *** 1.0 Loading the flights going to the destination... *** ]")
        go_flight = self.request_for_flight(self.origin_airport, self.destination_airport, self.departure_date)
        if not go_flight:
            return Response({"error": "Mock Airlines API failed."}, status=status.HTTP_400_BAD_REQUEST)
        
        print("[ *** 2.0 Loading the flights returning to the origin... *** ]")
        return_flight = {}
        if self.return_date: 
            return_flight = self.request_for_flight(self.destination_airport, self.origin_airport, self.return_date)
            if not return_flight:
                return Response({"error": "Mock Airlines API failed."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print("[ *** It's a one way trip! Skipping the return flight... *** ]")
        
        print("[ *** 3.0 Calculating the price informations for the flights options... *** ]")
        go_flight = self.calculate_price_info(go_flight)
        return_flight = self.calculate_price_info(return_flight)

        print("[ *** 4.0 Calculating the meta informations for the flights options... *** ]")
        go_flight = self.calculate_meta_info(go_flight)
        return_flight = self.calculate_meta_info(return_flight)

        print("[ *** 5.0 Combining the flights... *** ]")
        result = self.combine_the_flights(go_flight, return_flight)

        return Response(result)
    
    def request_for_flight(self, departure_airport: str, arrival_airport: str, departure_date: str):
        """Request the Mock flight search API"""
        apikey = "pzrvlDwoCwlzrWJmOzviqvOWtm4dkvuc"
        url = "http://stub.2xt.com.br/air/search/{}/{}/{}/{}".format(apikey, departure_airport, arrival_airport, departure_date)
        username = "demo"
        password = "swnvlD"

        response = requests.get(url=url,  auth=(username, password))
        if response.status_code != 200:
            return None

        self.data: dict = json.loads(response.content)
        return self.data
    
    def combine_the_flights(self, go_flight: dict, return_flight: dict) -> dict:
        result = {}
        result["origin"] = self.origin_airport
        result["destination"] = self.destination_airport
        result["departure_date"] = self.departure_date
        result["return_date"] = self.return_date

        options = []
        if "options" not in return_flight:
            for go in go_flight["options"]:
                option = {
                    "go_flight": go,
                    "return_flight": None,
                    "price": go["price"]
                }
                options.append(option)
            result["options"] = sorted(options, key=lambda dicionario: dicionario['price']['total'])
            return result

        for go in go_flight["options"]:
            for ret in return_flight["options"]:
                total_fare = go["price"]["fare"] + ret["price"]["fare"]
                total_fees = self.calculate_fees(total_fare)
                option = {
                    "go_flight": go,
                    "return_flight": ret,
                    "price": {
                        "fare": round(total_fare,2),
                        "fees": round(total_fees, 2),
                        "total": round(total_fare + total_fees, 2)
                    }
                }
                options.append(option)

        result["options"] = sorted(options, key=lambda dicionario: dicionario['price']['total'])
        return result
    
    def calculate_price_info(self, flight: dict = {}) -> dict:
        if "options" not in flight:
            return {}

        for flight_option in flight["options"]:
            flight_option["price"]["fees"] = round(self.calculate_fees(flight_option["price"]["fare"]), 2)
            flight_option["price"]["total"] = round(flight_option["price"]["fare"] + flight_option["price"]["fees"], 2)

        return flight
    
    def calculate_fees(self, fare: float) -> float:
        return 10/100 * fare if 10/100 * fare > 40 else 40
    
    def calculate_meta_info(self, flight: dict = {}) -> list:
        if "options" not in flight:
            return {}

        lon1 = flight["summary"]["from"]["lon"]
        lat1 = flight["summary"]["from"]["lat"]
        lon2 = flight["summary"]["to"]["lon"]
        lat2 = flight["summary"]["to"]["lat"]

        distance_between_airports = self.calculate_range_between_airports(lon1, lat1, lon2, lat2)

        for flight_option in flight["options"]:
            flight_duration = self.calculate_flight_duration(flight_option["departure_time"], flight_option["arrival_time"])

            flight_option["meta"]["range"] = round(distance_between_airports, 2)
            flight_option["meta"]["cruise_speed_kmh"] = round(distance_between_airports/flight_duration, 2)
            flight_option["meta"]["cost_per_km"] = round(flight_option["price"]["fare"]/distance_between_airports, 2)
        
        return flight
    
    def calculate_flight_duration(self, departure_time: str, arrival_time: str):
        departure_time = datetime.strptime(departure_time, '%Y-%m-%dT%H:%M:%S')
        arrival_time = datetime.strptime(arrival_time, '%Y-%m-%dT%H:%M:%S')
        return (arrival_time - departure_time).total_seconds()/3600
    
    def calculate_range_between_airports(self, lon1: float, lat1: float, lon2: float, lat2: float) -> float:
        """This method use haversine method to calculate the range between the two airports and return it in kilometers"""
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

        earth_radius = 6371
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        return c * earth_radius
    
    def is_something_wrong(self):
        """Check the received parameters before getting started and return a message error if there's some error or False if everything is fine"""
        test_cases = [
            {
                "condition": not self.origin_airport or not self.destination_airport,
                "error": "There must be the origin and the destination airports."
            },
            {
                "condition": self.origin_airport == self.destination_airport,
                "error": "The origin and the destination airports must be different."
            },
            {
                "condition": not self.departure_date,
                "error": "There must be the departure date."
            },
            {
                "condition": datetime.strptime(self.departure_date, '%Y-%m-%d').replace(hour=23, minute=59) < datetime.today() if self.departure_date else None,
                "error": "The departure date must not be before today."
            },
            {
                "condition": datetime.strptime(self.return_date, '%Y-%m-%d').replace(hour=23, minute=59) < datetime.strptime(self.departure_date, '%Y-%m-%d') if self.return_date and self.departure_date else None,
                "error": "The return date must be after the departure date."
            },
            {
                "condition": not Airport.objects.filter(iata=self.origin_airport).exists(),
                "error": "The origin airport is not registered on our database. Please, contact us to check it out."
            },
            {
                "condition": not Airport.objects.filter(iata=self.destination_airport).exists(),
                "error": "The destination airport is not registered on our database. Please, contact us to check it out."
            },
        ]
        for test in test_cases:
            if test["condition"]:
                return test["error"]
        return False