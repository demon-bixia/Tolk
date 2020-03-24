from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views as chat_views

router = SimpleRouter()
router.register(r'conversations', chat_views.ConversationsViewSet, basename='conversation')
router.register(r'notifications', chat_views.NotificationViewSet, basename='notification')
router.register(r'messages', chat_views.MessageViewSet, basename='message')
router.register(r'settings', chat_views.SettingsViewSet, basename='settings')

urlpatterns = [
    path("", chat_views.api_root, name="api-root"),
    path("create-group/", chat_views.CreateGroup.as_view(), name="create-group"),
    path("change-settings/", chat_views.ChangeSettings.as_view(), name="change-settings"),
]

# add router urls
urlpatterns += router.urls
