import os

# Confirme se "plataform.settings" é o caminho certo para suas configurações Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "plataform.settings")
import django

django.setup()

from behave import given, when, then
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from postagens.models import Post  # Confirme o caminho para seu modelo Post


@given('que um usuário autenticado para edição existe')  # Este decorator já estava correto
def step_impl_auth_user_edit(context):
    context.client = APIClient()

    # Dados do usuário de teste
    test_username = 'usuario_teste_edicao'
    test_email = 'usuario_teste_edicao@example.com'
    test_password = 'senha123Mudar'  # Recomendo senhas diferentes para usuários de teste diferentes

    # Limpa qualquer usuário de teste anterior para evitar conflitos
    User.objects.filter(username=test_username).delete()
    # Crie o usuário com email
    context.user = User.objects.create_user(
        username=test_username,
        email=test_email,  # Importante se o login for por email
        password=test_password
    )

    print(f"DEBUG (Editar Post - Auth): Usuário de teste criado: username='{test_username}', email='{test_email}'")

    # Autentica o usuário que ACABOU DE SER CRIADO
    login_payload = {
        'email': test_email,  # Use o email do usuário de teste
        'password': test_password  # Use a senha do usuário de teste
    }
    print(f"DEBUG (Editar Post - Auth): Payload para /api/token/: {login_payload}")

    response = context.client.post('/api/token/', login_payload)  # Ajuste '/api/token/' se necessário

    if response.status_code != 200:
        print(
            f"ERRO DE AUTENTICAÇÃO (Editar Post): Status {response.status_code}, Data: {response.data if hasattr(response, 'data') else response.content}")

    assert response.status_code == 200, f"Falha ao obter token para edição: {response.data if hasattr(response, 'data') else response.content}"
    token = response.data['access']
    context.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    print("DEBUG (Editar Post - Auth): Token obtido e usuário autenticado com sucesso.")


# CORRIGIDO: O Behave estava esperando "usuário" aqui, conforme os snippets da sua última saída.
@given('que um post existente foi criado pelo usuário autenticado')
def step_impl_existing_post_para_editar(context):  # Nome da função pode ser mais específico
    # Garanta que context.user foi definido no step anterior
    assert hasattr(context,
                   'user'), "Contexto não possui 'user'. O step de autenticação falhou ou não definiu context.user."

    titulo_original_edicao = 'Post Original para Editar BDD'
    # Limpa posts com o mesmo título para evitar duplicatas em execuções repetidas
    Post.objects.filter(titulo=titulo_original_edicao, autor=context.user).delete()

    payload_original = {
        'titulo': titulo_original_edicao,
        'conteudo': 'Conteúdo original que será modificado neste teste de edição.',
        'autor': context.user  # Para Post.objects.create(), o objeto User geralmente funciona
    }
    post = Post.objects.create(**payload_original)
    context.post_para_editar_id = post.id  # Use um nome de variável de contexto específico para este cenário

    assert Post.objects.filter(id=context.post_para_editar_id).exists(), "Post original para edição não foi criado."
    context.post_original_para_edicao = post  # Opcional: guardar o objeto todo
    print(
        f"DEBUG (Editar Post - Given Existing): Post '{post.titulo}' criado com ID {context.post_para_editar_id} pelo autor '{context.user.username}' para ser editado.")


# CORRIGIDO: O Behave estava esperando "usuário" aqui, conforme os snippets da sua última saída.
@when('o usuário envia um novo título e conteúdo para editar o post existente')
def step_impl_envia_dados_para_editar(context):  # Nome da função pode ser mais específico
    assert hasattr(context,
                   'post_para_editar_id'), "ID do post para editar (context.post_para_editar_id) não foi definido."
    assert hasattr(context, 'user'), "Usuário (context.user) não foi definido."

    payload_edicao = {
        'titulo': 'Post Efetivamente Editado BDD',  # Título diferente para clareza
        'conteudo': 'Este é o conteúdo após a edição bem-sucedida via BDD.',
        'autor': context.user.id  # Para a API, o ID do autor é o mais comum
    }

    # AJUSTE A URL se a sua API de edição for diferente.
    # Esta URL deve corresponder à sua configuração para atualizar um post específico.
    url_edicao = f'/api/postagens/{context.post_para_editar_id}/'

    print(
        f"DEBUG (Editar Post - When): Editando post ID {context.post_para_editar_id} na URL {url_edicao} com payload: {payload_edicao}")
    context.response = context.client.put(url_edicao, payload_edicao, format='json')


@then('o post deve ser atualizado com sucesso')  # Este decorator já estava correto
def step_impl_verify_post_editado(context):  # Nome da função pode ser mais específico
    print(f"DEBUG (Editar Post - Then): Resposta da API de edição - Status: {context.response.status_code}")
    # Adiciona verificação de 'content' para respostas que não sejam JSON (como 404 puro)
    if hasattr(context.response, 'content') and not hasattr(context.response, 'data'):
        print(
            f"DEBUG (Editar Post - Then): Resposta da API de edição - Content: {context.response.content.decode(errors='ignore')}")
    elif hasattr(context.response, 'data'):
        print(f"DEBUG (Editar Post - Then): Resposta da API de edição - Data: {context.response.data}")

    assert context.response.status_code == 200, \
        f"Esperado status 200 para edição, mas foi {context.response.status_code}. Resposta: {getattr(context.response, 'data', getattr(context.response, 'content', 'N/A'))}"

    data = context.response.data
    assert data['titulo'] == 'Post Efetivamente Editado BDD'
    assert data['conteudo'] == 'Este é o conteúdo após a edição bem-sucedida via BDD.'

    post_atualizado = Post.objects.get(id=context.post_para_editar_id)
    assert post_atualizado.titulo == 'Post Efetivamente Editado BDD'
    assert post_atualizado.conteudo == 'Este é o conteúdo após a edição bem-sucedida via BDD.'
    assert post_atualizado.autor == context.user  # Compara o objeto User
    print(f"DEBUG (Editar Post - Then): Post '{data['titulo']}' editado e verificado com sucesso no DB.")
