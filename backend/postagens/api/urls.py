# postagens/urls.py
from django.urls import path
from . import views
from .views import MinhasPostagensView

urlpatterns = [
    path('minhas/', MinhasPostagensView.as_view(), name='minhas-postagens'),

    path('', views.PostListCreateView.as_view(), name='post_list_create'),
    path('<int:pk>/', views.PostRetrieveUpdateDestroyView.as_view(), name='post_detail'),

    path('comentarios/', views.ComentariosListCreateView.as_view(), name='comentarios_list_create'),
    path('comentarios/<int:pk>/', views.ComentariosRetrieveUpdateDestroyView.as_view(), name='comentarios_detail'),
    path('<int:post_id>/comentarios/', views.ComentariosPorPostagemView.as_view(), name='comentarios_por_postagem'),
]

