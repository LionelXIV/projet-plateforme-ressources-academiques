from pathlib import Path
import random

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.db import transaction

class Command(BaseCommand):
    help = "Crée des courses d'exemple. Usage: manage.py create_courses [--count N] [--admin user:pass] [--with-docs]"

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='Nombre de courses à créer')
        parser.add_argument('--admin', type=str, help='Créer admin au format user:password (ex: admin:admin123)')
        parser.add_argument('--with-docs', action='store_true', help='Créer et attacher de petits fichiers/documents dans MEDIA_ROOT')

    def handle(self, *args, **options):
        User = get_user_model()
        count = options['count']
        admin_cred = options.get('admin')
        with_docs = options.get('with_docs', False)

        # create/update admin if requested
        if admin_cred:
            try:
                username, password = admin_cred.split(':', 1)
            except ValueError:
                self.stderr.write(self.style.ERROR("Format --admin invalide, utiliser user:password"))
                return
            admin, created = User.objects.get_or_create(username=username, defaults={'is_staff': True, 'is_superuser': True})
            admin.set_password(password)
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Admin assuré: {username} (créé={created})"))

        # default normal user
        user, ucreated = User.objects.get_or_create(username='user1', defaults={})
        if ucreated:
            user.set_password('pwd1')
            user.save()
            self.stdout.write(self.style.SUCCESS("Utilisateur 'user1' créé (pwd: pwd1)"))
        else:
            self.stdout.write("Utilisateur 'user1' existe déjà")

        # ensure MEDIA_ROOT exists
        media_root = Path(getattr(settings, 'MEDIA_ROOT', 'media'))
        media_root.mkdir(parents=True, exist_ok=True)
        docs_dir = media_root / 'courses_docs'
        if with_docs:
            docs_dir.mkdir(parents=True, exist_ok=True)

        from core.models import Course, Document  # local import

        titles = [
            "Développement Web Avancé", "Introduction à Python", "Bases de données",
            "Algorithmes et Structures", "Design UX/UI", "Marketing Digital"
        ]
        categories = ["Développement", "Design", "Marketing", "Business", "Langues"]
        levels = ["Débutant", "Intermédiaire", "Avancé"]

        created_count = 0
        with transaction.atomic():
            for i in range(count):
                title = f"{random.choice(titles)} — session {timezone.now().strftime('%Y%m%d')}-{i+1}"
                course = Course.objects.create(
                    title=title[:255],
                    description=f"Courte description pour {title}"[:500],
                    full_description=f"Description complète et détaillée pour {title}",
                    instructor=random.choice(["Marie Dupont", "Jean Martin", "Lucie Tremblay"]),
                    category=random.choice(categories),
                    level=random.choice(levels),
                    students=random.randint(0, 200),
                    image="",
                    author=user
                )

                created_docs = []
                if with_docs:
                    # create 1-3 small placeholder files and register Document with url pointing to MEDIA_URL
                    for j in range(random.randint(1, 3)):
                        fname = f"{course.id}_doc_{j+1}.txt"
                        dest = docs_dir / fname
                        dest.write_bytes(f"Document de test pour {course.title}\n".encode('utf-8'))
                        media_url = getattr(settings, 'MEDIA_URL', '/media/')
                        url = f"{media_url.rstrip('/')}/courses_docs/{fname}"
                        doc = Document.objects.create(course=course, name=fname, doc_type="TXT", size=str(dest.stat().st_size), url=url)
                        created_docs.append(doc)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Course créée: id={course.pk} title='{course.title}' documents={len(created_docs)}"))

        self.stdout.write(self.style.SUCCESS(f"Terminé: {created_count} course(s) créées (with_docs={with_docs})."))