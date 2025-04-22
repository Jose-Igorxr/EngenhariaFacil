import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "plataform.settings")
import django
django.setup()
from behave import given, when, then
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from postagens.models import Post

@given('que um usuário autenticado existe')
def before_all(context):
    context.client = APIClient()
    User.objects.filter(username='usuario_teste').delete()
    context.user = User.objects.create_user(username='usuario_teste', password='senha123')
    response = context.client.post('/api/token/', {
        'username': 'usuario_teste',
        'password': 'senha123'
    })
    assert response.status_code == 200
    token = response.data['access']
    context.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

@when('o usuário envia um título e conteúdo para criar um post')
def step_impl(context):
    payload = {
        'titulo': 'Meu Primeiro Post',
        'conteudo': 'Conteúdo incrível do meu post.'
    }
    context.response = context.client.post('/api/postagens/posts/', payload)


@then('o post deve ser criado com sucesso')
def step_impl(context):
    assert context.response.status_code == 201
    data = context.response.data
    assert data['titulo'] == 'Meu Primeiro Post'
    assert data['conteudo'] == 'Conteúdo incrível do meu post.'
    assert Post.objects.filter(titulo='Meu Primeiro Post').exists()
