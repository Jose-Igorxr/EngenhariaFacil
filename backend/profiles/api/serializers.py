# profiles/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from profiles.models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(allow_null=True, required=False)

    class Meta:
        model = Profile
        fields = ['user', 'profile_picture', 'created_at']