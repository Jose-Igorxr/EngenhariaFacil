# features/steps/profile_steps.py
import os
import django

os.environ['DJANGO_SETTINGS_MODULE'] = 'plataform.settings'
django.setup()

from behave import given, when, then
from django.core.files.uploadedfile import SimpleUploadedFile


@given('que eu estou logado como "{username}" com senha "{password}"')
def step_given_logged_in(context, username, password):
    print(f"Tentando criar/logar usuário: {username}")
    from django.contrib.auth.models import User
    from profiles.models import Profile
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework.test import APIClient

    try:
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, password=password)
            print(f"Usuário criado: {user}")
            Profile.objects.create(user=user)
            print("Perfil criado com sucesso")
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        print(f"Token JWT gerado: {token}")
        context.client = APIClient()
        context.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        context.user = user
    except Exception as e:
        print(f"Erro no Given: {str(e)}")
        raise


@when('eu envio uma nova foto de perfil "{filename}"')
def step_when_upload_photo(context, filename):
    print(f"Enviando foto: {filename}")
    file_content = "Conteúdo da imagem fictícia".encode('utf-8')
    uploaded_file = SimpleUploadedFile(filename, file_content, content_type="image/jpeg")

    context.response = context.client.put(
        '/api/profile/',
        {'profile_picture': uploaded_file},
        format='multipart'
    )
    print(f"Resposta do PUT: {context.response.status_code}")
    if context.response.status_code != 200:
        print(f"Erro na resposta: {context.response.content.decode()}")


@then('eu vejo que minha foto de perfil foi atualizada')
def step_then_photo_updated(context):
    print("Verificando atualização do perfil")
    from profiles.models import Profile

    profile = Profile.objects.get(user=context.user)
    print(f"Nome da foto no banco: {profile.profile_picture.name}")
    assert context.response.status_code == 200, f"Upload falhou com status {context.response.status_code}"
    assert profile.profile_picture is not None, "A foto de perfil não foi atualizada"
    assert profile.profile_picture.name.endswith(
        'minha_foto.jpg') or 'minha_foto.jpg' in profile.profile_picture.name, "Nome da foto incorreto"
    print("Foto de perfil atualizada com sucesso")