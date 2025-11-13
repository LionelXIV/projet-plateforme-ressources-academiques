from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import auth_jwt

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/login/', auth_jwt.login_jwt, name='api_login'),
    path('api/auth/register/', auth_jwt.register_user, name='api_register'),
    path('api/core/', include('backend.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)