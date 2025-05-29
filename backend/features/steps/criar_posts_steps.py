import os

# Certifique-se de que 'plataform.settings' é o caminho correto para suas configurações Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "plataform.settings")
import django

django.setup()

from behave import given, when, then
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from postagens.models import Post  # Confirme se este é o caminho correto para seu modelo Post


# NOTA: O nome da função para o @given foi alterado de 'before_all' para algo mais específico.
# 'before_all' tem um significado especial no Behave (hooks) e não deve ser usado para definições de steps.
@given('que um usuário autenticado existe')
def step_impl_usuario_autenticado_existe_para_criar(context):
    context.client = APIClient()

    # --- Dados do Usuário de Teste para Criação de Post ---
    test_username_creator = 'criador_de_posts'
    test_email_creator = 'criador@example.com'  # Email para login
    test_password_creator = 'senhaForte123!'  # Senha

    print(f"DEBUG (Criar Post - Auth): Preparando para criar/autenticar usuário: email='{test_email_creator}'")

    # 1. Limpa qualquer usuário de teste anterior para evitar conflitos
    #    Busque pelo email ou username, dependendo do que for mais único/confiável.
    User.objects.filter(email=test_email_creator).delete()
    # Ou, se username for o campo principal de busca para deleção:
    # User.objects.filter(username=test_username_creator).delete()

    # 2. Crie o usuário com username, email e password
    context.user_criador = User.objects.create_user(
        username=test_username_creator,  # Django User model requer username
        email=test_email_creator,  # Essencial se o login via token for por email
        password=test_password_creator
    )
    # context.user é frequentemente usado por convenção em steps seguintes
    context.user = context.user_criador

    print(
        f"DEBUG (Criar Post - Auth): Usuário '{context.user_criador.username}' criado com email '{context.user_criador.email}' e ID '{context.user_criador.id}'")

    # 3. Autentique o usuário que ACABOU DE SER CRIADO
    login_payload = {
        'email': test_email_creator,  # Use o email do usuário de teste
        'password': test_password_creator  # Use a senha do usuário de teste
    }
    print(f"DEBUG (Criar Post - Auth): Payload para /api/token/: {login_payload}")

    response = context.client.post('/api/token/', login_payload)  # Ajuste '/api/token/' se necessário

    # Mensagem de erro detalhada se a autenticação falhar
    if response.status_code != 200:
        print(
            f"ERRO FATAL (Criar Post - Auth): Falha ao obter token. Status: {response.status_code}, Resposta: {response.data}")

    assert response.status_code == 200, f"Falha ao obter token para criação de post: {response.data}"

    token = response.data['access']
    context.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    print(f"DEBUG (Criar Post - Auth): Token obtido e '{context.user_criador.username}' autenticado com sucesso.")


@when('o usuário envia um título e conteúdo para criar um post')
def step_impl_envia_dados_criar_post(context):
    # Certifique-se de que context.user (ou context.user_criador) foi definido no step @given
    assert hasattr(context,
                   'user_criador'), "Usuário para criação (context.user_criador) não foi definido no step anterior."

    payload = {
        'titulo': 'Meu Primeiro Post BDD',
        'conteudo': 'Conteúdo incrível do meu post criado via BDD.',
        'autor': context.user_criador.id
    }
    print(f"DEBUG (Criar Post - When): Enviando payload para criar post: {payload}")


    context.response = context.client.post('/api/postagens/', payload, format='json')


@then('o post deve ser criado com sucesso')
def step_impl_post_criado_com_sucesso(context):
    print(
        f"DEBUG (Criar Post - Then): Resposta da API - Status: {context.response.status_code}, Data: {context.response.data}")

    # Para criação bem-sucedida, o status HTTP geralmente é 201 Created.
    assert context.response.status_code == 201, \
        f"Esperado status 201 para criação, mas foi {context.response.status_code}. Resposta: {context.response.data}"

    data = context.response.data
    assert data['titulo'] == 'Meu Primeiro Post BDD'
    assert data['conteudo'] == 'Conteúdo incrível do meu post criado via BDD.'

    # Verifique se o post realmente existe no banco de dados
    assert Post.objects.filter(titulo='Meu Primeiro Post BDD', autor=context.user_criador).exists(), \
        "Post não encontrado no banco de dados após a criação."
    print(f"DEBUG (Criar Post - Then): Post '{data['titulo']}' criado e verificado com sucesso no DB.")