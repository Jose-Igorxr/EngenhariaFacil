from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenRefreshView

# Login Customizado (sem SimpleJWT por enquanto)


class CustomLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print("Dados recebidos:", request.data)  # Debug

        if not email or not password:
            return Response({"detail": "Email e senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        print("Usuário:", user, "Senha no banco:",
              user.password if user else None)  # Debug
        if user and user.password == password:  # Comparação direta (sem hash)
            return Response({"access": "fake_token", "refresh": "fake_refresh"}, status=status.HTTP_200_OK)
        return Response({"detail": "Email ou senha inválidos."}, status=status.HTTP_401_UNAUTHORIZED)

# Registro (mantendo o original)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Refresh Token (do SimpleJWT)

from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, EmailTokenObtainPairSerializer

# View para registro
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# View para login
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class RefreshTokenView(TokenRefreshView):
    pass
