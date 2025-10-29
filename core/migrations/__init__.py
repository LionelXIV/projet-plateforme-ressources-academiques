from django.core.management.base import BaseCommand
from django.db import transaction
from django.apps import apps
from django.contrib.auth import get_user_model
import traceback
from contextlib import nullcontext

from core.models import Ressource

CANDIDATES = {
    'publication': ['Publication', 'Article', 'Post'],
    'applications': ['ContenuPedagogique', 'Contenu', 'Application', 'CourseContent'],
    'telechargement': ['Fichier', 'Telechargement', 'UploadedFile', 'File'],
}

USER_MODEL = get_user_model()

def find_model(app_label, names):
    for name in names:
        try:
            return apps.get_model(app_label, name)
        except LookupError:
            continue
    return None

def pick_attr(obj, candidates, default=None):
    for c in candidates:
        if hasattr(obj, c):
            return getattr(obj, c)
    return default

class Command(BaseCommand):
    help = "Copie enregistrements depuis publication / applications / telechargement vers core.Ressource"

    def add_arguments(self, parser):
        parser.add_argument('--default-user-id', type=int, help='ID utilisateur par défaut si source n’a pas d’auteur')
        parser.add_argument('--dry-run', action='store_true', help='Simuler sans enregistrer')

    def handle(self, *args, **options):
        default_user = None
        if options.get('default_user_id'):
            try:
                default_user = USER_MODEL.objects.get(pk=options['default_user_id'])
            except USER_MODEL.DoesNotExist:
                self.stderr.write(f"Utilisateur par défaut id={options['default_user_id']} introuvable.")
                return

        dry_run = options.get('dry_run', False)
        summary = {}
        total_copied = 0

        for app_label, names in CANDIDATES.items():
            Model = find_model(app_label, names)
            if not Model:
                self.stdout.write(self.style.WARNING(f"Aucun modèle trouvé pour l'app '{app_label}' (candidates: {names})."))
                continue

            qs = Model.objects.all()
            count = qs.count()
            summary[app_label] = {'found_model': Model.__name__, 'objects': count, 'copied': 0}
            self.stdout.write(f"Traitement {app_label}.{Model.__name__} — {count} objets")

            atomic_ctx = transaction.atomic() if not dry_run else nullcontext()
            with atomic_ctx:
                for obj in qs:
                    try:
                        titre = pick_attr(obj, ['titre', 'title', 'name'], f"{app_label} #{getattr(obj, 'pk', '')}")
                        description = pick_attr(obj, ['description', 'desc', 'contenu'], '') or ''
                        mots_cles = pick_attr(obj, ['mots_cles', 'keywords', 'tags'], '') or ''
                        fichier_field = pick_attr(obj, ['fichier', 'file', 'uploaded_file', 'document'], None)
                        type_contenu = pick_attr(obj, ['type_contenu', 'content_type', 'mime'], 'pdf') or 'pdf'
                        matiere = pick_attr(obj, ['matiere', 'subject', 'course'], '') or ''
                        universite = pick_attr(obj, ['universite', 'university'], '') or ''
                        theme = pick_attr(obj, ['theme', 'category'], '') or ''
                        date_pub = pick_attr(obj, ['date_publication', 'created_at', 'created'], None)
                        date_mod = pick_attr(obj, ['date_modification', 'updated_at', 'modified'], None)
                        auteur = pick_attr(obj, ['auteur', 'author', 'user', 'owner'], None)

                        resolved_auteur = None
                        if auteur is None:
                            resolved_auteur = default_user
                        else:
                            if isinstance(auteur, (int, str)):
                                try:
                                    resolved_auteur = USER_MODEL.objects.get(pk=int(auteur))
                                except Exception:
                                    resolved_auteur = default_user
                            else:
                                if getattr(auteur, 'pk', None) is not None:
                                    try:
                                        if auteur.__class__ == USER_MODEL:
                                            resolved_auteur = auteur
                                        else:
                                            resolved_auteur = USER_MODEL.objects.get(pk=getattr(auteur, 'pk'))
                                    except Exception:
                                        resolved_auteur = default_user
                                else:
                                    resolved_auteur = default_user

                        r = Ressource(
                            titre=str(titre)[:200],
                            description=str(description),
                            mots_cles=str(mots_cles)[:500],
                            type_contenu=str(type_contenu)[:15],
                            matiere=str(matiere)[:100],
                            universite=str(universite)[:100],
                            theme=str(theme)[:100],
                            est_publie=True,
                        )
                        if date_pub:
                            try:
                                r.date_publication = date_pub
                            except Exception:
                                pass
                        if date_mod:
                            try:
                                r.date_modification = date_mod
                            except Exception:
                                pass
                        if resolved_auteur:
                            r.auteur = resolved_auteur

                        if fichier_field:
                            if hasattr(fichier_field, 'name'):
                                r.fichier.name = fichier_field.name
                            else:
                                r.fichier.name = str(fichier_field)

                        if dry_run:
                            summary[app_label]['copied'] += 1
                            total_copied += 1
                            continue

                        r.save()
                        summary[app_label]['copied'] += 1
                        total_copied += 1

                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f"Erreur lors de la copie de {app_label} id={getattr(obj, 'pk', '?')}: {e}"))
                        self.stderr.write(traceback.format_exc())

            self.stdout.write(self.style.SUCCESS(f"Terminé {app_label}: copiés {summary[app_label]['copied']} / {summary[app_label]['objects']}"))

        self.stdout.write(self.style.MIGRATE_HEADING("Résumé:"))
        for k, v in summary.items():
            self.stdout.write(f" - {k}: modèle={v.get('found_model')} objets={v.get('objects')} copiés={v.get('copied')}")
        self.stdout.write(self.style.SUCCESS(f"Total copiés: {total_copied} (dry-run={dry_run})"))