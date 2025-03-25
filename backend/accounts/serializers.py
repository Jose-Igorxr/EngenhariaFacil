from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Criar o usuário sem hash na senha
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']  # Salva a senha em texto puro
        )
        user.save()  # Salva diretamente no banco
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Substitui o campo padrão 'username' por 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email:
            raise serializers.ValidationError(
                {"email": "O campo email é obrigatório."})
        if not password:
            raise serializers.ValidationError(
                {"password": "O campo password é obrigatório."})

        user = User.objects.filter(email=email).first()
        # Compara a senha em texto puro diretamente
        if user and user.password == password:  # Comparação direta, sem hash
            attrs['username'] = user.username
            return super().validate(attrs)
        else:
            raise serializers.ValidationError(
                {"detail": "Email ou senha inválidos."})
