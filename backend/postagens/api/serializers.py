# serializers.py

from rest_framework import serializers
from postagens.models import Post
from postagens.models import Comentarios

class PostSerializer(serializers.ModelSerializer):
    autor = serializers.CharField(source='autor.username', read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'titulo', 'conteudo', 'autor', 'data_criacao', 'data_atualizacao', 'imagem']

class ComentariosSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comentarios
        fields = ['id', 'titulo', 'conteudo', 'autor', 'data_criacao']

