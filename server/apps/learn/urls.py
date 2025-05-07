from django.urls import path
from .views import TopicDetailView

urlpatterns = [
    path('<int:pk>/', TopicDetailView.as_view(), name='topic-detail-in-learning-mode')
]