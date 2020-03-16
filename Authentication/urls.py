from django.urls import path

from . import views as auth_views

urlpatterns = [
    path("login/", auth_views.login_view, name="login"),
    path("logout/", auth_views.logout_view, name="logout"),
    path("authenticated/", auth_views.UserAuthenticated.as_view(), name="is-authenticated"),
]
