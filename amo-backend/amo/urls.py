from rest_framework import routers
from django.urls import path
from amo.views import AirportView, PanelAirportView, MockAirlinesView

router = routers.DefaultRouter()

urlpatterns = [
    path('airports/', AirportView.as_view(), name='airports'),
    path('panel-airport/', PanelAirportView.as_view(), name='panel-airport'),
    path('mock-airlines/', MockAirlinesView.as_view(), name='mock-airlines'),
]

urlpatterns += router.urls