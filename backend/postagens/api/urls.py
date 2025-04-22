# urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.PostListCreateView.as_view(), name='post_list_create'),
    path('posts/<int:pk>/', views.PostRetrieveUpdateDestroyView.as_view(), name='post_detail'),
    path('comentarios/', views.ComentariosListCreateView.as_view(), name='comentarios_list_create'),
    path('comentarios/<int:pk>/', views.ComentariosRetrieveUpdateDestroyView.as_view(), name='comentarios_detail'),

]
