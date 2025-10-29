from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from . import auth_jwt  # new

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),

    path('api/auth/login/', auth_jwt.login_jwt, name='api_login'),
    path('api/auth/logout/', auth_jwt.logout_jwt, name='api_logout'),

    path('', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)