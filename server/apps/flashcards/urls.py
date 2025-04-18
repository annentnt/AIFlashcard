from django.urls import path, include
from .views import GenerateFlashcardsView, TopicView, TopicDetailView

urlpatterns = [
    path('generate/', GenerateFlashcardsView.as_view(), name='generate-flashcards'),
    path('', TopicView.as_view(), name='topic'),
    path('<int:pk>/', TopicDetailView.as_view(), name='topic-detail'),
]