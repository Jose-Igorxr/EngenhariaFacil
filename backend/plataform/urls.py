from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from profiles.api.views import EmailTokenObtainPairView


schema_view = get_schema_view(
    openapi.Info(
        title="API Obra Fácil",
        default_version='v1',
        description="Documentação da API da plataforma Obra fácil, responsável por trabalhar com os dados necessários para o funcionamento do site.",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contato@minhaapi.com"),
        license=openapi.License(name="MIT"),
    ),
    public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/profiles/', include('profiles.api.urls')),
    path('api/token/', EmailTokenObtainPairView.as_view(),
         name='token_obtain_pair'),  # Usar EmailTokenObtainPairView
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/postagens/', include('postagens.api.urls')),
    path('api/predict/', include('predict.api.urls')),
    path('swagger/', schema_view.with_ui('swagger',
         cache_timeout=0), name='schema-swagger-ui'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
