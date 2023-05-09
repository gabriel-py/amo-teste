from amo.models import Airport
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from model_bakery import baker
from rest_framework.test import APIClient

class TestMockAirlinesApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = baker.make(User)
        self.client.force_authenticate(user=self.user)
        self.origin_airport = baker.make(
            Airport, 
            iata="SAO", 
            city="São Paulo",
            state="SP",
            lat="-23",
            lon="-46",
        )
        self.destination_airport = baker.make(
            Airport, 
            iata="BHZ", 
            city="Belo Horizonte",
            state="MG",
            lat="-19",
            lon="-43",
        )
        self.departure_date = "2023-05-10"
        self.return_date = "2023-05-17"

    def test_get(self):
        endpoint = f"{reverse('mock-airlines')}?origin={self.origin_airport.iata}&destination={self.destination_airport.iata}&departure_date={self.departure_date}&return_date={self.return_date}"
        request = self.client.get(endpoint)
        data = request.json()
        self.assertEqual(request.status_code, 200)
        self.assertEqual(data["origin"], self.origin_airport.iata)
        self.assertEqual(data["destination"], self.destination_airport.iata)
        self.assertEqual(data["departure_date"], self.departure_date)
        self.assertEqual(data["return_date"], self.return_date)
