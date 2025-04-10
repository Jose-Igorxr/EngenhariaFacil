from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from profiles.models import Profile
from profiles.api.serializers import ProfileSerializer
from django.contrib.auth import update_session_auth_hash

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Pega ou cria o perfil do usuário logado
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        data = request.data

        # Edição do nome
        if 'username' in data:
            request.user.username = data['username']
            request.user.save()

        # Edição da senha
        if 'current_password' in data and 'new_password' in data:
            if request.user.check_password(data['current_password']):
                request.user.set_password(data['new_password'])
                request.user.save()
            else:
                return Response({'error': 'Senha atual incorreta'}, status=status.HTTP_400_BAD_REQUEST)

        # Edição da foto de perfil
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)