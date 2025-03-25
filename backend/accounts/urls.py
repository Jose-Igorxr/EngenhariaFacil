from django.urls import path
from .views import CustomLoginView, RegisterView, RefreshTokenView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
]
