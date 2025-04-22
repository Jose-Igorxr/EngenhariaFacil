# serializers.py

from rest_framework import serializers
from postagens.models import Post
from postagens.models import Comentarios

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'titulo', 'conteudo', 'autor', 'data_criacao', 'data_atualizacao']

class ComentariosSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comentarios
        fields = ['id', 'titulo', 'conteudo', 'autor', 'data_criacao']

