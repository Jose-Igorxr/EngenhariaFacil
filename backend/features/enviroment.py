# features/environment.py
import os
import django
from django.test.utils import setup_test_environment
from django.test.runner import DiscoverRunner

def before_all(context):
    os.environ['DJANGO_SETTINGS_MODULE'] = 'plataform.settings'
    print(f"DJANGO_SETTINGS_MODULE configurado como: {os.environ['DJANGO_SETTINGS_MODULE']}")
    django.setup()
    print("Django inicializado com sucesso")
    setup_test_environment()
    context.test_runner = DiscoverRunner()
    context.test_runner.setup_test_environment()
    context.old_db_config = context.test_runner.setup_databases()

def after_all(context):
    context.test_runner.teardown_databases(context.old_db_config)
    context.test_runner.teardown_test_environment()

def before_scenario(context, scenario):
    from rest_framework.test import APIClient
    from profiles.models import Profile
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(username="testuser")
        Profile.objects.filter(user=user).delete()
        print("Perfil de testuser limpo")
    except User.DoesNotExist:
        pass
    context.client = APIClient()
    print(f"Cliente de teste criado para o cenário: {scenario.name}")