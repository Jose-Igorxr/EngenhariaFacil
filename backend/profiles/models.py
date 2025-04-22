from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os
from uuid import uuid4


def user_profile_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{instance.user.username}_{uuid4().hex[:8]}.{ext}"
    return os.path.join('profile_pics', instance.user.username, filename)


class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_path, null=True, blank=True)

    # Adicionando de volta os campos de soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Perfil de {self.user.username}"
