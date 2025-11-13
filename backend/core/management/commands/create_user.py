from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Crée un utilisateur simple : manage.py create_user username password [--email EMAIL]"

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Nom d’utilisateur')
        parser.add_argument('password', type=str, help='Mot de passe')
        parser.add_argument('--email', type=str, default='', help='Email (optionnel)')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        password = options['password']
        email = options['email'] or ''
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"Utilisateur '{username}' existe déjà"))
            return
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = True
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Utilisateur '{username}' créé avec succès"))