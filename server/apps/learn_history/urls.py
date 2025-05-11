from django.urls import path
from .views import QeStatus

urlpatterns = [
    path('status/<str:Qstatus>', QeStatus.as_view(), name='query-status'),
    path('status/', QeStatus.as_view(), name='operator working with a card')
]