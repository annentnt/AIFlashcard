"""
URL configuration for memoria project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/flashcards/", include("apps.flashcards.urls")),
    path("api/auth/", include("apps.auth_user.urls")),
    path("api/pronunciation/", include("apps.pronunciation.urls")),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/knowledge_graph/', include('apps.knowledge_graph.urls')),
    path('api/learn/', include('apps.learn.urls')),
]
# Thêm URL cho media files trong development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)