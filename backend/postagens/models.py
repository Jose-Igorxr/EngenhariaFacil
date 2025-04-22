# models.py

from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo

class Comentarios(models.Model):
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comentarios')
    data_criacao = models.DateTimeField(auto_now_add=True)