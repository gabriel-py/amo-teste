from django.conf import settings
from django.core.management.base import BaseCommand
from amo.tasks import AirportsETL

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--client", help="client abbrev", type=str)

    def handle(self, *args, **options):
        print("starting...")
        print(AirportsETL().run())