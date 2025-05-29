from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.password_validation import validate_password
from ..models import Profile  # Certifique-se de que o caminho para Profile está correto
from django.core import validators
from django.core.exceptions import ValidationError as DjangoValidationError


class ProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True,  # Permite que seja nulo
        validators=[
            validators.FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png']),
        ]
    )

    class Meta:
        model = Profile
        fields = ['profile_picture']

    def validate_profile_picture(self, value):
        if value is None:  # Se for nulo, não há o que validar em termos de tamanho
            return value
        max_size = 5 * 1024 * 1024  # 5MB em bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                "O arquivo de imagem deve ter no máximo 5MB."
            )
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Garante que a URL da imagem seja absoluta, se houver uma imagem e um request no contexto
        if instance.profile_picture and hasattr(instance.profile_picture, 'url'):
            request = self.context.get('request')
            if request:
                try:
                    representation['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
                except Exception:  # Em caso de erro ao construir a URI (raro, mas para segurança)
                    representation['profile_picture'] = instance.profile_picture.url
            # else: # Se não houver request, mantém a URL relativa (comportamento padrão do ImageField)
            #   representation['profile_picture'] = instance.profile_picture.url
        # Se não houver profile_picture, a representação já será None ou como o ImageField(allow_null=True) lida
        return representation


class UserSerializer(serializers.ModelSerializer):
    # Profile agora pode ser atualizado junto com o User
    profile = ProfileSerializer(required=False, allow_null=True)
    # Campos para alteração de senha
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # Password é para cadastro e para definir uma nova senha na atualização
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'password', 'current_password', 'profile']
        extra_kwargs = {
            # Email é obrigatório tanto na criação quanto para identificação (não pode ser atualizado para vazio)
            'email': {'required': True, 'allow_blank': False},
            # Username é obrigatório na criação (não pode ser atualizado para vazio)
            'username': {
                'required': True,
                'allow_blank': False,
                'validators': [
                    v for v in User._meta.get_field('username').validators
                    if not isinstance(v, validators.RegexValidator)  # Mantém sua lógica de validadores
                ],
            },
            # 'password': {'write_only': True, 'required': False, 'allow_blank': True} # Já definido acima
        }

    def validate(self, attrs):
        request = self.context.get('request')
        instance = self.instance  # self.instance é o objeto User sendo atualizado (None na criação)

        # Validações para CRIAÇÃO (POST)
        if request and request.method == 'POST':
            if not attrs.get('password'):  # Password é obrigatório na criação
                raise serializers.ValidationError(
                    {"password": "Este campo é obrigatório para cadastro."}
                )
            try:
                validate_password(attrs['password'])
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

            # Username deve ser único na criação
            if 'username' in attrs and User.objects.filter(username=attrs['username']).exists():
                raise serializers.ValidationError(
                    {"username": "Este nome de usuário já está em uso."}
                )
            # Email deve ser único na criação
            if 'email' in attrs and User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError(
                    {"email": "Este email já está em uso."}
                )

        # Validações para ATUALIZAÇÃO (PUT/PATCH)
        if instance:  # Se estamos atualizando um usuário existente
            # Se um novo username foi fornecido e é diferente do atual, verifique a unicidade
            if 'username' in attrs and attrs['username'] != instance.username:
                if User.objects.filter(username=attrs['username']).exclude(pk=instance.pk).exists():
                    raise serializers.ValidationError({"username": "Este nome de usuário já está em uso."})

            # Se um novo email foi fornecido e é diferente do atual, verifique a unicidade
            if 'email' in attrs and attrs['email'] != instance.email:
                if User.objects.filter(email=attrs['email']).exclude(pk=instance.pk).exists():
                    raise serializers.ValidationError({"email": "Este email já está em uso."})

            # Lógica para mudança de senha
            new_password = attrs.get('password')
            current_password = attrs.get('current_password')

            if new_password:  # Se uma nova senha foi fornecida
                if not current_password:
                    raise serializers.ValidationError({
                        "current_password": "Para definir uma nova senha, a senha atual é obrigatória."
                    })
                if not instance.check_password(current_password):
                    raise serializers.ValidationError({
                        "current_password": "Senha atual incorreta."
                    })
                try:  # Valide a nova senha também
                    validate_password(new_password, user=instance)
                except DjangoValidationError as e:
                    raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop('profile', None)  # Profile é criado separadamente
        validated_data.pop('current_password', None)  # Não usado na criação

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user)  # Cria um perfil padrão para o novo usuário
        return user

    def update(self, instance, validated_data):
        # Lida com dados do perfil aninhado
        profile_data = validated_data.pop('profile', None)

        # Lida com a alteração de senha (já validada no método validate)
        new_password = validated_data.pop('password', None)
        validated_data.pop('current_password', None)  # Apenas para validação, não para setar no modelo

        if new_password:
            instance.set_password(new_password)

        # Atualiza os campos do User (modelo principal)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualiza o perfil aninhado, se houver dados para ele
        if profile_data is not None:
            # Garante que o perfil exista (get_or_create é mais seguro)
            profile_instance, created = Profile.objects.get_or_create(user=instance)

            profile_picture_file = profile_data.get('profile_picture')
            if profile_picture_file is not None:  # Se 'null' for enviado para limpar, ou um novo arquivo
                profile_instance.profile_picture = profile_picture_file  # Permite limpar ou definir nova
            profile_instance.save()

        return instance


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # Continua usando email para login

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email is None or password is None:
            raise AuthenticationFailed(
                "Email e senha são obrigatórios.", code='authorization')  # Adicionado code
        data = super().validate(attrs)
        user = self.user

        data['user_id'] = user.id
        data['user'] = {
            'username': user.username,
            'email': user.email,
            'id': user.id,
        }
        # Você também pode querer adicionar a URL da foto do perfil aqui, se desejar
        if hasattr(user, 'profile') and user.profile.profile_picture and hasattr(user.profile.profile_picture, 'url'):
            request = self.context.get('request')
            profile_pic_url = user.profile.profile_picture.url
            if request:
                profile_pic_url = request.build_absolute_uri(profile_pic_url)
            data['user']['profile_picture_url'] = profile_pic_url
        else:
            data['user']['profile_picture_url'] = None

        return data