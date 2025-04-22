from django.urls import path
from .views import WordPronunciation, SentencePronunciation

urlpatterns = [
    path('word/<str:word>', WordPronunciation.as_view()),
    path('sentence/', SentencePronunciation.as_view())
]