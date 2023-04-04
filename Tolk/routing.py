from django.urls import path
from chat import consumers as chat_consumers

websocket_urlpatterns = [
    path('ws/chat/', chat_consumers.ChatConsumer.as_asgi()),
]
