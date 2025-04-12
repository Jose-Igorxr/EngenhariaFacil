from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/profiles/', include('profiles.urls')),  # Confirme que está assim
    path('api/token/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),  # Login
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),  # Refresh do token
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
