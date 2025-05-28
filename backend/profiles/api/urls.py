from django.urls import path
from .views import RegisterView, EmailTokenObtainPairView, RefreshTokenView, MeProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('me/', MeProfileView.as_view(), name='profile-me'),
]
