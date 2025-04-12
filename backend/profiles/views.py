from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from .serializers import UserSerializer, EmailTokenObtainPairSerializer

# Registrar novo usuário
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Login com email e senha (JWT)
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# Token refresh
class RefreshTokenView(TokenRefreshView):
    pass

# Obter e atualizar dados do usuário logado
class MeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("🔒 Requisição recebida no /me/")
        print("🔑 Usuário autenticado:", request.user)
        print("📧 Email:", request.user.email)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        print("🔄 Requisição PUT recebida no /me/")
        print("📝 Dados recebidos:", request.data)

        serializer = UserSerializer(
            user,
            data=request.data,
            context={'request': request},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            print("✅ Usuário atualizado com sucesso.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        print("❌ Erros na validação:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
