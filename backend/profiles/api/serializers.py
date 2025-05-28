from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from ..models import Profile
from django.core import validators


class ProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(
        required=False,
        validators=[
            validators.FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png']),
        ]
    )

    class Meta:
        model = Profile
        fields = ['profile_picture']

    def validate_profile_picture(self, value):
        max_size = 5 * 1024 * 1024  # 5MB em bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                "O arquivo de imagem deve ter no máximo 5MB."
            )
        return value

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            url = obj.profile_picture.url
            full_url = request.build_absolute_uri(url) if request else url
            print(f"📸 URL da imagem retornada: {full_url}")
            return full_url
        print("⚠️ Nenhuma imagem de perfil encontrada no objeto Profile.")
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    current_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'password', 'current_password', 'profile']
        extra_kwargs = {
            'email': {'required': True},
            'username': {
                'required': True,
                'validators': [
                    v for v in User._meta.get_field('username').validators
                    if not isinstance(v, validators.RegexValidator)
                ],
            },
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')
        validated_data.pop('current_password', None)  # Não usado na criação
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        Profile.objects.create(
            user=user,
            profile_picture=profile_data.get('profile_picture', None)
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        current_password = validated_data.pop('current_password', None)
        new_password = validated_data.pop('password', None)

        print(f"📝 Dados validados recebidos: {validated_data}")
        print(f"🔑 Current password: {current_password}")
        print(f"🔒 New password: {new_password}")

        # Atualização da senha
        if new_password:
            if not current_password:
                raise serializers.ValidationError(
                    {"detail": "A senha atual é obrigatória para alterar a senha."}
                )
            if not instance.check_password(current_password):
                raise serializers.ValidationError(
                    {"detail": "Senha atual incorreta."}
                )
            validate_password(new_password)
            instance.set_password(new_password)
            print(f"✅ Nova senha definida para o usuário {instance.username}")

        # Atualização do username
        username = validated_data.get('username', instance.username)
        if username != instance.username:
            if User.objects.filter(username=username).exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {"detail": "Este nome de usuário já está em uso."}
                )
            instance.username = username
            print(f"📛 Nome de usuário atualizado para: {username}")

        # Atualização do email
        email = validated_data.get('email', instance.email)
        if email != instance.email:
            if User.objects.filter(email=email).exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {"detail": "Este email já está em uso."}
                )
            instance.email = email
            print(f"📧 Email atualizado para: {email}")

        instance.save()
        print(f"💾 Usuário {instance.username} salvo no banco de dados")

        # Atualização do perfil
        profile = getattr(instance, 'profile', None)
        if profile and profile_data:
            new_profile_picture = profile_data.get('profile_picture', None)
            print(f"📁 Profile data recebido: {profile_data}")
            print(f"🖼️ Novo profile picture: {new_profile_picture}")
            if new_profile_picture:
                profile.profile_picture = new_profile_picture
                profile.save()
                print(f"📸 Imagem salva em: {profile.profile_picture.path}")

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
                    {"password": list(e.messages)}
                )

            if User.objects.filter(username=attrs['username']).exists():
                raise serializers.ValidationError(
                    {"username": "Este nome de usuário já está em uso."}
                )
            if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError(
                    {"email": "Este email já está em uso."}
                )
        return attrs


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email is None or password is None:
            raise serializers.ValidationError(
                "Email e senha são obrigatórios."
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")

        data = super().validate({
            self.username_field: email,
            "password": password
        })

        data['user_id'] = user.id
        data['user'] = {
            'username': user.username,
            'email': user.email,
            'id': user.id,
        }

        return data
