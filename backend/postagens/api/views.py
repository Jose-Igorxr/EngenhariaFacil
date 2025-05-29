from rest_framework.permissions import IsAuthenticated
from postagens.models import Post
from .serializers import PostSerializer
from postagens.models import Comentarios
from .serializers import ComentariosSerializer
from rest_framework import generics, permissions, filters # Adicionado filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'conteudo', 'autor__username']
    ordering_fields = ['data_publicacao', 'titulo']


    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)


class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_object(self):
        post = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE'] and post.autor != self.request.user:
            raise PermissionDenied("Você não tem permissão para acessar ou modificar este post.")
        return post

class MinhasPostagensView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(autor=request.user)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


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
class ComentariosPorPostagemView(generics.ListCreateAPIView):
    serializer_class = ComentariosSerializer

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comentarios.objects.filter(postagem_id=post_id)

    def perform_create(self, serializer):
        serializer.save(
            autor=self.request.user,
            postagem_id=self.kwargs['post_id']
        )