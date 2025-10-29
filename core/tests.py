from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.conf import settings
import tempfile
import shutil
import os
import io

from .models import Ressource
from .forms import RessourceForm

User = get_user_model()

class RessourceSimpleTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pwd')
        Ressource.objects.create(titre='T1', description='D1', auteur=self.user)

    def test_list_endpoint_returns_objects(self):
        url = reverse('core:liste')
        resp = self.client.get(url, follow=False)
        if resp.status_code in (301, 302):
            redirect_url = resp['Location']
            resp = self.client.get(redirect_url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('results', data)
        self.assertGreaterEqual(data['total_items'], 1)


class CoreIntegrationTests(TestCase):
    def setUp(self):
        # setup temp MEDIA_ROOT
        self._tmp_media = tempfile.mkdtemp(prefix="test_media_")
        self._old_media_root = getattr(settings, 'MEDIA_ROOT', None)
        settings.MEDIA_ROOT = self._tmp_media

        # users
        self.user = User.objects.create_user(username='user1', password='pwd1')
        self.other = User.objects.create_user(username='other', password='pwd2')

        # small sample file
        self.sample_file = SimpleUploadedFile("sample.pdf", b"%PDF-1.4 sample", content_type="application/pdf")

        # sample resource authored by self.user
        self.res = Ressource.objects.create(
            titre="Test R",
            description="Desc",
            mots_cles="django, test",
            fichier=self.sample_file,
            type_contenu='pdf',
            matiere='Informatique',
            universite='UQAR',
            theme='Tests',
            est_publie=True,
            auteur=self.user
        )

    def tearDown(self):
        # restore MEDIA_ROOT and remove tmp dir
        if self._old_media_root is not None:
            settings.MEDIA_ROOT = self._old_media_root
        try:
            shutil.rmtree(self._tmp_media)
        except Exception:
            pass

    def test_list_endpoint(self):
        url = reverse('core:liste')
        resp = self.client.get(url, follow=False)
        if resp.status_code in (301, 302):
            resp = self.client.get(resp['Location'])
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('results', data)
        self.assertGreaterEqual(data['total_items'], 1)

    def test_detail_endpoint(self):
        url = reverse('core:detail', args=[self.res.pk])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['id'], self.res.pk)
        self.assertEqual(data['titre'], self.res.titre)

    def test_download_endpoint(self):
        url = reverse('core:download', args=[self.res.pk])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        cd = resp.get('Content-Disposition', '')
        self.assertIn('attachment', cd)
        # FileResponse does not expose .content; consume streaming_content
        body = b"".join(resp.streaming_content)
        self.assertTrue(len(body) > 0)

    def test_search_api(self):
        url = reverse('core:api_recherche')
        resp = self.client.get(url, {'q': 'django'})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('resultats', data)
        found = any(r['id'] == self.res.pk for r in data.get('resultats', []))
        self.assertTrue(found)

    def test_create_requires_auth_and_creates(self):
        url = reverse('core:creer')
        # not logged -> should redirect or be forbidden
        resp = self.client.post(url, {})
        self.assertIn(resp.status_code, (302, 401, 403))

        # login and create with file
        self.client.force_login(self.user)
        uploaded = SimpleUploadedFile("upload.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        data = {
            'titre': 'Nouvelle',
            'description': 'desc',
            'mots_cles': 'a,b',
            'type_contenu': 'pdf',
            'matiere': 'X',
            'universite': 'Y',
            'theme': 'Z',
            'est_publie': 'on',
            'fichier': uploaded,
        }
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn('id', body)
        created = Ressource.objects.filter(pk=body['id']).first()
        self.assertIsNotNone(created)
        self.assertEqual(created.auteur, self.user)
        self.assertTrue(bool(created.fichier.name))
        self.assertTrue(os.path.exists(created.fichier.path))

    def test_modify_permission_and_update(self):
        url = reverse('core:modifier', args=[self.res.pk])

        # other user cannot modify
        self.client.force_login(self.other)
        resp = self.client.post(url, {'titre': 'Hack'})
        self.assertEqual(resp.status_code, 403)

        # author can modify (use full data to be safe)
        self.client.force_login(self.user)
        resp = self.client.post(url, {'titre': 'Updated', 'description': self.res.description, 'type_contenu': self.res.type_contenu})
        self.assertIn(resp.status_code, (200, 201))
        self.res.refresh_from_db()
        self.assertEqual(self.res.titre, 'Updated')

    def test_delete_permission_and_file_removed(self):
        url = reverse('core:supprimer', args=[self.res.pk])

        # other cannot delete
        self.client.force_login(self.other)
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 403)

        # author deletes
        self.client.force_login(self.user)
        file_path = self.res.fichier.path if self.res.fichier else None
        self.assertTrue(file_path and os.path.exists(file_path))
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Ressource.objects.filter(pk=self.res.pk).exists())
        if file_path:
            self.assertFalse(os.path.exists(file_path))

    def test_form_validation_rejects_large_and_invalid_ext(self):
        large = SimpleUploadedFile("big.pdf", b"0" * (50 * 1024 * 1024 + 1), content_type="application/pdf")
        data = {
            'titre': 'T',
            'description': 'D',
            'mots_cles': 'k',
            'type_contenu': 'pdf'
        }
        form = RessourceForm(data, {'fichier': large})
        self.assertFalse(form.is_valid())
        self.assertIn('fichier', form.errors)

        bad = SimpleUploadedFile("bad.exe", b"bin", content_type="application/octet-stream")
        form2 = RessourceForm(data, {'fichier': bad})
        self.assertFalse(form2.is_valid())
        self.assertIn('fichier', form2.errors)

    def test_migrate_command_dry_run_runs(self):
        # silence output of the management command during tests
        out = io.StringIO()
        err = io.StringIO()
        try:
            call_command('migrate_to_core', '--dry-run', stdout=out, stderr=err)
        except Exception as e:
            self.fail(f"migrate_to_core --dry-run raised: {e}")