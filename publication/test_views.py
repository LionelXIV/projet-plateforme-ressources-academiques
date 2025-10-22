from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Publication

class PublicationViewsTest(TestCase):
    """
    Tests pour les vues CRUD de Publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.client = Client()
        
        # Créer des utilisateurs de test
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        # Créer une publication de test
        self.publication = Publication.objects.create(
            titre='Test Publication',
            description='Description de test',
            mots_cles='test, django',
            type_contenu='pdf',
            matiere='Informatique',
            universite='UQAR',
            theme='Django',
            auteur=self.user1,
            est_publie=True
        )
    
    def test_publication_list_view(self):
        """Test de la vue de liste des publications"""
        response = self.client.get(reverse('publication:list'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Publication')
        self.assertTemplateUsed(response, 'publication/publication_list.html')
    
    def test_publication_list_view_with_search(self):
        """Test de la vue de liste avec recherche"""
        response = self.client.get(reverse('publication:list'), {'search': 'Test'})
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Publication')
    
    def test_publication_list_view_with_filters(self):
        """Test de la vue de liste avec filtres"""
        response = self.client.get(reverse('publication:list'), {
            'type': 'pdf',
            'matiere': 'Informatique'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Publication')
    
    def test_publication_detail_view(self):
        """Test de la vue de détail d'une publication"""
        response = self.client.get(reverse('publication:detail', args=[self.publication.pk]))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Publication')
        self.assertTemplateUsed(response, 'publication/publication_detail.html')
    
    def test_publication_detail_view_not_found(self):
        """Test de la vue de détail avec ID inexistant"""
        response = self.client.get(reverse('publication:detail', args=[999]))
        
        self.assertEqual(response.status_code, 404)
    
    def test_publication_create_view_get(self):
        """Test de la vue de création (GET)"""
        self.client.login(username='user1', password='testpass123')
        response = self.client.get(reverse('publication:create'))
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'publication/publication_form.html')
    
    def test_publication_create_view_post(self):
        """Test de la vue de création (POST)"""
        self.client.login(username='user1', password='testpass123')
        
        data = {
            'titre': 'Nouvelle Publication',
            'description': 'Description de la nouvelle publication',
            'mots_cles': 'nouveau, test',
            'type_contenu': 'video',
            'matiere': 'Mathématiques',
            'universite': 'UQAR',
            'theme': 'Maths',
            'est_publie': True
        }
        
        response = self.client.post(reverse('publication:create'), data)
        
        # Vérifier la redirection
        self.assertEqual(response.status_code, 302)
        
        # Vérifier que la publication a été créée
        new_publication = Publication.objects.get(titre='Nouvelle Publication')
        self.assertEqual(new_publication.auteur, self.user1)
        self.assertEqual(new_publication.matiere, 'Mathématiques')
    
    def test_publication_create_view_requires_login(self):
        """Test que la création nécessite une connexion"""
        response = self.client.get(reverse('publication:create'))
        
        # Redirection vers la page de connexion
        self.assertEqual(response.status_code, 302)
    
    def test_publication_update_view_get(self):
        """Test de la vue de modification (GET)"""
        self.client.login(username='user1', password='testpass123')
        response = self.client.get(reverse('publication:update', args=[self.publication.pk]))
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'publication/publication_form.html')
        self.assertContains(response, 'Test Publication')
    
    def test_publication_update_view_post(self):
        """Test de la vue de modification (POST)"""
        self.client.login(username='user1', password='testpass123')
        
        data = {
            'titre': 'Publication Modifiée',
            'description': 'Description modifiée',
            'mots_cles': 'modifié, test',
            'type_contenu': 'pdf',
            'matiere': 'Informatique',
            'universite': 'UQAR',
            'theme': 'Django',
            'est_publie': True
        }
        
        response = self.client.post(reverse('publication:update', args=[self.publication.pk]), data)
        
        # Vérifier la redirection
        self.assertEqual(response.status_code, 302)
        
        # Vérifier que la publication a été modifiée
        self.publication.refresh_from_db()
        self.assertEqual(self.publication.titre, 'Publication Modifiée')
    
    def test_publication_update_view_wrong_user(self):
        """Test de modification par un utilisateur non autorisé"""
        self.client.login(username='user2', password='testpass123')
        response = self.client.get(reverse('publication:update', args=[self.publication.pk]))
        
        # Redirection vers la page de détail
        self.assertEqual(response.status_code, 302)
    
    def test_publication_update_view_admin(self):
        """Test de modification par un administrateur"""
        self.client.login(username='admin', password='adminpass123')
        response = self.client.get(reverse('publication:update', args=[self.publication.pk]))
        
        self.assertEqual(response.status_code, 200)
    
    def test_publication_delete_view_get(self):
        """Test de la vue de suppression (GET)"""
        self.client.login(username='user1', password='testpass123')
        response = self.client.get(reverse('publication:delete', args=[self.publication.pk]))
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'publication/publication_confirm_delete.html')
        self.assertContains(response, 'Test Publication')
    
    def test_publication_delete_view_post(self):
        """Test de la vue de suppression (POST)"""
        self.client.login(username='user1', password='testpass123')
        
        response = self.client.post(reverse('publication:delete', args=[self.publication.pk]))
        
        # Vérifier la redirection
        self.assertEqual(response.status_code, 302)
        
        # Vérifier que la publication a été supprimée
        self.assertFalse(Publication.objects.filter(pk=self.publication.pk).exists())
    
    def test_publication_delete_view_wrong_user(self):
        """Test de suppression par un utilisateur non autorisé"""
        self.client.login(username='user2', password='testpass123')
        response = self.client.get(reverse('publication:delete', args=[self.publication.pk]))
        
        # Redirection vers la page de détail
        self.assertEqual(response.status_code, 302)
    
    def test_my_publications_view(self):
        """Test de la vue 'Mes publications'"""
        self.client.login(username='user1', password='testpass123')
        response = self.client.get(reverse('publication:my_publications'))
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'publication/my_publications.html')
        self.assertContains(response, 'Test Publication')
    
    def test_my_publications_view_requires_login(self):
        """Test que 'Mes publications' nécessite une connexion"""
        response = self.client.get(reverse('publication:my_publications'))
        
        # Redirection vers la page de connexion
        self.assertEqual(response.status_code, 302)
    
    def test_publication_create_with_file(self):
        """Test de création avec fichier"""
        self.client.login(username='user1', password='testpass123')
        
        # Créer un fichier de test
        test_file = SimpleUploadedFile(
            "test.pdf",
            b"file_content",
            content_type="application/pdf"
        )
        
        data = {
            'titre': 'Publication avec fichier',
            'description': 'Description avec fichier',
            'mots_cles': 'fichier, test',
            'type_contenu': 'pdf',
            'matiere': 'Informatique',
            'universite': 'UQAR',
            'theme': 'Django',
            'est_publie': True,
            'fichier': test_file
        }
        
        response = self.client.post(reverse('publication:create'), data)
        
        # Vérifier la redirection
        self.assertEqual(response.status_code, 302)
        
        # Vérifier que la publication avec fichier a été créée
        new_publication = Publication.objects.get(titre='Publication avec fichier')
        self.assertTrue(new_publication.fichier)
    
    def test_publication_pagination(self):
        """Test de la pagination"""
        # Créer plusieurs publications pour tester la pagination
        for i in range(15):
            Publication.objects.create(
                titre=f'Publication {i}',
                description=f'Description {i}',
                mots_cles=f'test{i}',
                type_contenu='pdf',
                matiere='Informatique',
                universite='UQAR',
                theme='Django',
                auteur=self.user1,
                est_publie=True
            )
        
        response = self.client.get(reverse('publication:list'))
        
        self.assertEqual(response.status_code, 200)
        # Vérifier que la pagination est présente
        self.assertContains(response, 'Page')
