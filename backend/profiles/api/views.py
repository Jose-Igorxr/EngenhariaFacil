from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from .serializers import UserSerializer, EmailTokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    pass


class MeProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        print("🔒 Requisição recebida no /me/")
        print("🔑 Usuário autenticado:", request.user)
        print("📧 Email:", request.user.email)
        serializer = UserSerializer(request.user, context={'request': request})
        serialized_data = serializer.data
        print("📤 Resposta serializada (GET):", serialized_data)
        return Response(serialized_data)

    def put(self, request):
        user = request.user
        print("🔄 Requisição PUT recebida no /me/")
        print("📝 Dados recebidos:", request.data)
        print("📁 Arquivos recebidos:", request.FILES)

        serializer = UserSerializer(
            user,
            data=request.data,
            context={'request': request},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            serialized_data = serializer.data
            print("✅ Usuário atualizado com sucesso.")
            print("📤 Resposta serializada (PUT):", serialized_data)
            return Response(serialized_data, status=status.HTTP_200_OK)

        print("❌ Erros na validação:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
