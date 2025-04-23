from django.urls import path
from .views import WordPronunciation, SentencePronunciation, Evaluate

urlpatterns = [
    path('word/<str:word>', WordPronunciation.as_view()),
    path('sentence/', SentencePronunciation.as_view()),
    path('evaluate/', Evaluate.as_view())
]