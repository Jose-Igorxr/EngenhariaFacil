from rest_framework.test import APITestCase
from rest_framework import status
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plataform.settings')
django.setup()

from django.urls import reverse

class AuthTests(APITestCase):
    def test_login_com_credenciais_invalidas(self):
        url = reverse('login')
        dados = {
            "email": "usuario_inexistente@email.com",
            "password": "senha_incorreta"
        }

        response = self.client.post(url, dados, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], "Usuário e/ou senha incorreto(s)")

        print("🛑 Login inválido corretamente rejeitado:", response.data)


class CadastroTests(APITestCase):
    def test_cadastro_com_dados_invalidos(self):
        url = reverse('register')
        dados_invalidos = {
            "username": "",
            "email": "email-invalido",
            "profile": {
                "profile_picture": "arquivo.txt"
            }
        }

        response = self.client.post(url, dados_invalidos, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertIn('profile', response.data)

        print("⚠️ Cadastro inválido corretamente rejeitado:", response.data)
