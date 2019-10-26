from django.urls import path

from . import views as chat_views

urlpatterns = [
    path('', chat_views.Index.as_view(), name='index'),
]
