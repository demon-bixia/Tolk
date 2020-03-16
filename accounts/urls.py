from django.urls import path, include
from rest_framework.routers import SimpleRouter

from accounts import views as accounts_views

# register ViewSets
router = SimpleRouter()

router.register(r'users', accounts_views.UserViewSet, basename='user')
router.register(r'contacts', accounts_views.ContactViewSet, basename='contact')

urlpatterns = [
    path("add-friend/", accounts_views.add_friend, name="add-friend"),
    path('register/', accounts_views.RegisterView.as_view(), name='register'),
]

# accounts urls
urlpatterns += router.urls
