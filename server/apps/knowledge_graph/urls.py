from django.urls import path
from .views import KGView

urlpatterns = [
    path('<int:pk>/', KGView.as_view(), name="knowledge_graph"),
]