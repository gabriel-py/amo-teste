from amo.models import Airport
from django.utils import timezone
import pandas as pd
import requests

class AirportsETL():
    def __init__(self) -> None:
        self.data = ()
        self.airports_already_treated = []
        self.log = {
            "started_at": timezone.now(),
            "finished_at": None,
            "success": True,
            "n_airports_inserted": 0,
            "n_airports_updated": 0,
            "message": None
        }

    def run(self) -> dict:
        if self.request_for_airports():
            self.update_data()
            self.insert_data()
        
        self.log["finished_at"] = timezone.now()
        return self.log

    def request_for_airports(self) -> bool:
        """Request the Airports API and return True if everything is okay"""
        url = "http://stub.2xt.com.br/air/airports/pzrvlDwoCwlzrWJmOzviqvOWtm4dkvuc"
        username = "demo"
        password = "swnvlD"

        response = requests.get(url=url,  auth=(username, password))
        if response.status_code != 200:
            self.log["message"] = "[{}] Request to the external API failed.".format(response.status_code)
            self.log["success"] = False
            return False

        self.data: tuple = response.json().items()
        return True
    
    def update_data(self) -> None:
        """Update the data of the airports that already exists on our database"""
        all_airports_returned_from_api = [element[0] for element in self.data]
        all_data = [element[1] for element in self.data]

        fields = ["iata", "city", "state", "lat", "lon"]
        airports_df = pd.DataFrame(all_data, columns=fields)

        db_fields = ["id"] + fields
        database_df = pd.DataFrame(Airport.objects.filter(iata__in=all_airports_returned_from_api).values(*db_fields), columns=db_fields).rename(
            columns={field: field+"_db" for field in fields if field != "iata"}
        )

        dataset_df = airports_df.merge(database_df, how="inner", on=['iata']).astype({
            "lat": float,
            "lon": float,
            "lat_db": float,
            "lon_db": float
        })
        
        airports_to_update = [
            Airport(**item) for item in dataset_df.loc[
                (dataset_df["city"] != dataset_df["city_db"]) |
                (dataset_df["state"] != dataset_df["state_db"]) |
                (dataset_df["lat"] != dataset_df["lat_db"]) |
                (dataset_df["lon"] != dataset_df["lon_db"])
            ].drop(columns=[field+"_db" for field in fields if field != "iata"]).to_dict('records')
        ]
        if len(airports_to_update) > 0:
            Airport.objects.bulk_update(objs=airports_to_update, fields=fields, batch_size=1000)
            self.log["n_airports_updated"] = len(airports_to_update)

        self.airports_already_treated = dataset_df["iata"].tolist()
    
    def insert_data(self) -> None:
        """Insert the data of the airports that yet doesn't exist on our database"""
        all_data = [element[1] for element in self.data]
        data_to_insert = [item for item in all_data if item["iata"] not in self.airports_already_treated]

        airports_to_create = [Airport(**airport) for airport in data_to_insert]
        if len(airports_to_create) > 0:
            Airport.objects.bulk_create(airports_to_create, batch_size=1000)
            self.log["n_airports_inserted"] = len(airports_to_create)