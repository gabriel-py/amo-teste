from django.db import models
from django.contrib.auth.models import User

class Airport(models.Model):
    iata = models.CharField(max_length=3, unique=True)
    city = models.CharField(max_length=256)
    state = models.CharField(max_length=2)
    lat = models.DecimalField(max_digits=12, decimal_places=10)
    lon = models.DecimalField(max_digits=12, decimal_places=10)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'airport'

class AirportLog(models.Model):
    ACTION = (
        ('ACTIVATE', 'ACTIVATE'),
        ('DEACTIVATE', 'DEACTIVATE'),
    )
    airport = models.ForeignKey(Airport, on_delete=models.CASCADE)
    action = models.CharField(max_length=12, choices=ACTION)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    details = models.TextField(blank=True, null=True)
    action_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'airport_log'