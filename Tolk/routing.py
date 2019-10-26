from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter, ProtocolTypeRouter
from django.urls import path

from chat import consumers as chat_consumers

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/load/', chat_consumers.LoadConsumer),
            path('ws/chat/', chat_consumers.ChatConsumer),
        ])
    )
})
