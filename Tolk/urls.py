"""Tolk URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
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
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path

from accounts import views as auth_views
from . import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chat.urls'), ),
    path('accounts/authenticated/', auth_views.UserAuthenticated.as_view(), name='authenticated'),
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/register/', auth_views.RegisterView.as_view(), name='register'),
    re_path(r"^active/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$",
            auth_views.ActivateAccount.as_view(), name="active"),
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/update/', auth_views.ContactUpdateView.as_view(), name='update'),
    path('accounts/update/contact_pic/', auth_views.ChangeContactPicture.as_view(), name='change_contact_pic'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
