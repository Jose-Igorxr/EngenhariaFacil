# views.py

from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from postagens.models import Post
from .serializers import PostSerializer
from postagens.models import Comentarios
from .serializers import ComentariosSerializer

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post = super().get_object()
        if post.autor != self.request.user:
            raise PermissionDenied("Você não tem permissão para acessar ou modificar este post.")
        return post

class ComentariosListCreateView(generics.ListCreateAPIView):
    queryset = Comentarios.objects.all()
    serializer_class = ComentariosSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

class ComentariosRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comentarios.objects.all()
    serializer_class = ComentariosSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        comentarios = super().get_object()
        if comentarios.autor != self.request.user:
            raise PermissionDenied("Você não tem permissão para acessar ou modificar este comentário.")
        return comentarios