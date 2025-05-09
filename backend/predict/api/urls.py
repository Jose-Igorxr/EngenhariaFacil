from django.urls import path
from .views import EstimativaIAView

urlpatterns = [
    path('', EstimativaIAView.as_view(),
         name='estimativa-ia'),  # Mapeia /api/predict/
]
