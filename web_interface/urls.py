from django.urls import path

from web_interface import views

urlpatterns = [
    path("", views.Interface.as_view(), name="interface"),
]
