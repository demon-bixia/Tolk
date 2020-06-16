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
from django.urls import path, include

from . import settings

urlpatterns = [
    # admin site
    path('admin/', admin.site.urls),
    # account urls
    path("api/", include('accounts.urls')),
    # authentication urls
    path("api/", include('Authentication.urls')),
    # chat urls
    path("api/", include('chat.urls')),
    # app web interface
    path("", include('web_interface.urls')),
]

# serve user uploaded media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
