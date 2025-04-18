from django.urls import path
from .views import WordPronunciation

urlpatterns = [
    path('word/<str:word>', WordPronunciation.as_view())
]