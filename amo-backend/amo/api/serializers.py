from rest_framework import serializers

class AirportSerializer(serializers.Serializer):
    iata = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    lat = serializers.CharField()
    lon = serializers.CharField()
    is_active = serializers.BooleanField()

class AirportLogSerializer(serializers.Serializer):
    airport = AirportSerializer()
    action = serializers.CharField()
    user = serializers.CharField()
    action_time = serializers.DateTimeField()
    details = serializers.CharField()