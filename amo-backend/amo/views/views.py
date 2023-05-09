from amo.api.serializers import AirportSerializer, AirportLogSerializer
from amo.models import Airport, AirportLog
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class AirportView(APIView):
    def get(self, request):
        airports = Airport.objects.all()
        serializer = AirportSerializer(airports, many=True)
        return Response(serializer.data)

class PanelAirportView(APIView):
    def get(self, request):
        if not request.GET.get("iata"):
            return Response({'status': 'You must provide the IATA of the airport to receive its logs.'}, status=status.HTTP_400_BAD_REQUEST)

        airport_logs = AirportLog.objects.filter(airport__iata=request.GET.get("iata"))
        serializer = AirportLogSerializer(airport_logs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not "iata" in request.data or not "action" in request.data:
            return Response({'status': 'You must provide the IATA of the airport and the action.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.data["action"].upper() not in ["ACTIVATE", "DEACTIVATE"]:
            return Response({'status': 'You must provide a valid action. It is either activate or deactivate a airport.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            airport_obj = Airport.objects.get(iata=request.data["iata"])
        except Airport.DoesNotExist:
            return Response({'status': 'Airport not found with the passed IATA.'}, status=status.HTTP_404_NOT_FOUND)

        log_obj = None
        if request.data["action"].upper() == "DEACTIVATE":
            airport_obj.is_active = False
            airport_obj.save()
            log_obj = AirportLog.objects.create(
                airport=airport_obj,
                action="DEACTIVATE",
                details=request.data["reason_text"],
                user=request.user
            )
        else:
            airport_obj.is_active = True
            airport_obj.save()
            log_obj = AirportLog.objects.create(
                airport=airport_obj,
                action="ACTIVATE",
                user=request.user
            )

        serializer = AirportLogSerializer(log_obj)
        return Response(serializer.data)
