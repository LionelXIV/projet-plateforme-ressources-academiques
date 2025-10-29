from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.core.files import File
from pathlib import Path
import random
import os

class Command(BaseCommand):
    help = "Crée des données d'exemple: admin, users et ressources. Usage: manage.py create_sample_data [--count N] [--admin user:pass] [--with-files]"

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='Nombre de ressources à créer')
        parser.add_argument('--admin', type=str, help='Créer admin au format user:password (ex: admin@uqar.ca:admin123)')
        parser.add_argument('--with-files', action='store_true', help='Créer et attacher de petits fichiers dans MEDIA_ROOT')

    def handle(self, *args, **options):
        User = get_user_model()
        count = options['count']
        admin_cred = options.get('admin')
        with_files = options.get('with_files', False)

        # create admin if requested
        if admin_cred:
            try:
                username, password = admin_cred.split(':', 1)
            except ValueError:
                self.stderr.write(self.style.ERROR("Format --admin invalide, utiliser user:password"))
                return
            admin, created = User.objects.get_or_create(username=username, defaults={'is_staff': True, 'is_superuser': True})
            if created:
                admin.set_password(password)
                admin.save()
                self.stdout.write(self.style.SUCCESS(f"Admin créé: {username}"))
            else:
                admin.set_password(password)
                admin.is_staff = True
                admin.is_superuser = True
                admin.save()
                self.stdout.write(self.style.WARNING(f"Admin existant mis à jour: {username}"))

        # create a normal user
        user, ucreated = User.objects.get_or_create(username='user1', defaults={})
        if ucreated:
            user.set_password('pwd1')
            user.save()
            self.stdout.write(self.style.SUCCESS("Utilisateur 'user1' créé (pwd: pwd1)"))
        else:
            self.stdout.write("Utilisateur 'user1' existe déjà")

        media_root = Path(getattr(settings, 'MEDIA_ROOT', 'media'))
        media_root.mkdir(parents=True, exist_ok=True)

        sample_dir = Path(settings.BASE_DIR) / 'media' / 'contenus'
        available_files = []
        if sample_dir.exists():
            for p in sample_dir.iterdir():
                if p.is_file():
                    available_files.append(p)

        # create sample resources
        from core.models import Ressource
        types = ['pdf', 'video', 'audio', 'texte', 'image', 'presentation']
        for i in range(count):
            titre = f"Exemple ressource #{i+1}"
            desc = f"Description automatique pour la ressource {i+1}"
            matiere = random.choice(['Informatique', 'Mathématiques', 'Marketing', 'Design'])
            theme = random.choice(['Examen', 'Projet', 'Cours'])
            type_contenu = random.choice(types)
            r = Ressource(
                titre=titre[:200],
                description=desc,
                mots_cles="exemple, test",
                type_contenu=type_contenu,
                matiere=matiere,
                universite="UQAR",
                theme=theme,
                date_publication=timezone.now(),
                est_publie=True,
                auteur=user
            )

            if with_files:
                if available_files:
                    src = random.choice(available_files)
                    dest_dir = media_root / 'ressources'
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    dest = dest_dir / f"{int(timezone.now().timestamp())}_{src.name}"
                    with src.open('rb') as fr, dest.open('wb') as fw:
                        fw.write(fr.read())
                    with dest.open('rb') as fobj:
                        r.fichier.save(dest.name, File(fobj), save=False)
                else:
                    dest_dir = media_root / 'ressources'
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    dest = dest_dir / f"sample_{i+1}.txt"
                    dest.write_bytes(b"Contenu de test\n")
                    with dest.open('rb') as fobj:
                        r.fichier.save(dest.name, File(fobj), save=False)

            r.save()
            self.stdout.write(self.style.SUCCESS(f"Ressource créée: {r.titre} (id={r.pk})"))

        self.stdout.write(self.style.SUCCESS(f"Terminé — {count} ressources créées."))