from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from django.core import validators


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture']
        extra_kwargs = {
            'profile_picture': {'required': False, 'allow_null': True}
        }


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True},
        }
        extra_kwargs = {
            'username': {'validators': [v for v in User._meta.get_field('username').validators if not isinstance(v, validators.RegexValidator)]},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(
            user=user,
            profile_picture=profile_data.get('profile_picture', None)
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        current_password = validated_data.pop('current_password', None)
        new_password = validated_data.get('password')

        if new_password:
            if not current_password:
                raise serializers.ValidationError(
                    {"detail": "A senha atual é obrigatória para alterar a senha."}
                )
            if not instance.check_password(current_password):
                raise serializers.ValidationError(
                    {"detail": "Senha atual incorreta."}
                )
            instance.set_password(new_password)

        email = validated_data.get('email', instance.email)
        if email != instance.email:
            if User.objects.filter(email=email).exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {"detail": "Este email já está em uso."}
                )
            instance.email = email

        instance.username = validated_data.get('username', instance.username)
        instance.save()

        profile = getattr(instance, 'profile', None)
        if profile and profile_data:
            profile.profile_picture = profile_data.get(
                'profile_picture', profile.profile_picture)
            profile.save()

        return instance

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            if 'password' not in attrs:
                raise serializers.ValidationError(
                    {"password": "Este campo é obrigatório para cadastro."}
                )
            try:
                validate_password(attrs['password'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError(
                    {"password": list(e.messages)})

            if User.objects.filter(username=attrs['username']).exists():
                raise serializers.ValidationError(
                    {"username": "Este nome de usuário já está em uso."})
            if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError(
                    {"email": "Este email já está em uso."})
        return attrs


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # Garante que ele use email no login

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email is None or password is None:
            raise serializers.ValidationError(
                "Email e senha são obrigatórios.")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")

        # Substitui o 'username' por email para a autenticação do JWT
        data = super().validate({
            self.username_field: attrs['email'],  # Usa a chave 'email'
            "password": password
        })

        data['user'] = {
            'username': user.username,
            'email': user.email,
            'id': user.id,
        }

        return data
