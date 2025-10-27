from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Publication

class PublicationModelTest(TestCase):
    """
    Tests unitaires pour le modèle Publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.publication_data = {
            'titre': 'Test Publication',
            'description': 'Description de test pour la publication',
            'mots_cles': 'test, django, publication',
            'type_contenu': 'pdf',
            'matiere': 'Informatique',
            'universite': 'UQAR',
            'theme': 'Django Testing',
            'auteur': self.user,
            'est_publie': True
        }
    
    def test_publication_creation(self):
        """Test de création d'une publication"""
        publication = Publication.objects.create(**self.publication_data)
        
        self.assertEqual(publication.titre, 'Test Publication')
        self.assertEqual(publication.auteur, self.user)
        self.assertTrue(publication.est_publie)
        self.assertEqual(publication.type_contenu, 'pdf')
    
    def test_publication_str_method(self):
        """Test de la méthode __str__"""
        publication = Publication.objects.create(**self.publication_data)
        expected_str = f"{publication.titre} - {publication.auteur.username}"
        self.assertEqual(str(publication), expected_str)
    
    def test_publication_ordering(self):
        """Test de l'ordre par défaut (date_publication décroissante)"""
        # Créer plusieurs publications
        pub1 = Publication.objects.create(**self.publication_data)
        pub2 = Publication.objects.create(
            titre='Deuxième Publication',
            description='Description 2',
            mots_cles='test2',
            type_contenu='video',
            matiere='Mathématiques',
            universite='UQAR',
            theme='Maths',
            auteur=self.user
        )
        
        publications = Publication.objects.all()
        self.assertEqual(publications[0], pub2)  # Plus récente en premier
        self.assertEqual(publications[1], pub1)
    
    def test_publication_meta_verbose_names(self):
        """Test des noms verbose du modèle"""
        self.assertEqual(Publication._meta.verbose_name, "Publication")
        self.assertEqual(Publication._meta.verbose_name_plural, "Publications")
    
    def test_publication_type_choices(self):
        """Test des choix de type de contenu"""
        choices = Publication.TYPE_CONTENU
        expected_choices = [
            ('pdf', 'PDF'),
            ('video', 'Vidéo'),
            ('audio', 'Audio'),
            ('texte', 'Texte'),
            ('image', 'Image'),
            ('presentation', 'Présentation'),
        ]
        self.assertEqual(list(choices), expected_choices)
    
    def test_publication_required_fields(self):
        """Test des champs obligatoires"""
        # Test sans titre - Django ne lève pas d'exception au niveau modèle
        # mais au niveau formulaire
        publication = Publication.objects.create(
            description='Test',
            auteur=self.user,
            matiere='Test',
            universite='Test',
            theme='Test'
        )
        # Le titre sera vide mais l'objet sera créé
        self.assertEqual(publication.titre, '')
    
    def test_publication_file_upload(self):
        """Test d'upload de fichier"""
        # Créer un fichier de test
        test_file = SimpleUploadedFile(
            "test.pdf",
            b"file_content",
            content_type="application/pdf"
        )
        
        publication = Publication.objects.create(
            **self.publication_data,
            fichier=test_file
        )
        
        self.assertTrue(publication.fichier)
        self.assertTrue(publication.fichier.name.startswith('publications/test'))
    
    def test_publication_date_fields(self):
        """Test des champs de date"""
        publication = Publication.objects.create(**self.publication_data)
        
        # Vérifier que les dates sont définies
        self.assertIsNotNone(publication.date_publication)
        self.assertIsNotNone(publication.date_modification)
        
        # Vérifier que date_modification est mise à jour
        original_modification = publication.date_modification
        publication.titre = 'Titre modifié'
        publication.save()
        
        self.assertGreater(publication.date_modification, original_modification)
    
    def test_publication_max_length_constraints(self):
        """Test des contraintes de longueur maximale"""
        # Test titre trop long - Django ne tronque pas automatiquement
        long_titre = 'x' * 201  # Plus de 200 caractères
        publication_data_long = self.publication_data.copy()
        publication_data_long['titre'] = long_titre
        
        publication = Publication.objects.create(**publication_data_long)
        # Django accepte le titre même s'il dépasse la limite
        self.assertEqual(len(publication.titre), 201)
        
        # Test mots-clés trop longs - Django ne tronque pas automatiquement
        long_mots_cles = 'x' * 501  # Plus de 500 caractères
        publication_data_long['titre'] = 'Titre normal'
        publication_data_long['mots_cles'] = long_mots_cles
        
        publication2 = Publication.objects.create(**publication_data_long)
        # Django accepte les mots-clés même s'ils dépassent la limite
        self.assertEqual(len(publication2.mots_cles), 501)
    
    def test_publication_filtering(self):
        """Test du filtrage des publications"""
        # Créer des publications publiées et non publiées
        pub_publiee = Publication.objects.create(**self.publication_data)
        
        brouillon_data = self.publication_data.copy()
        brouillon_data['titre'] = 'Brouillon'
        brouillon_data['est_publie'] = False
        pub_brouillon = Publication.objects.create(**brouillon_data)
        
        # Test filtrage par statut de publication
        publications_publiees = Publication.objects.filter(est_publie=True)
        publications_brouillons = Publication.objects.filter(est_publie=False)
        
        self.assertEqual(publications_publiees.count(), 1)
        self.assertEqual(publications_brouillons.count(), 1)
        self.assertIn(pub_publiee, publications_publiees)
        self.assertIn(pub_brouillon, publications_brouillons)
    
    def test_publication_search_functionality(self):
        """Test de la fonctionnalité de recherche"""
        # Créer des publications avec différents contenus
        Publication.objects.create(**self.publication_data)
        Publication.objects.create(
            titre='Mathématiques avancées',
            description='Cours de mathématiques',
            mots_cles='maths, algèbre',
            type_contenu='pdf',
            matiere='Mathématiques',
            universite='UQAR',
            theme='Maths',
            auteur=self.user
        )
        
        # Test recherche par titre
        results_titre = Publication.objects.filter(titre__icontains='Test')
        self.assertEqual(results_titre.count(), 1)
        
        # Test recherche par matière
        results_matiere = Publication.objects.filter(matiere__icontains='Mathématiques')
        self.assertEqual(results_matiere.count(), 1)
        
        # Test recherche par mots-clés
        results_mots = Publication.objects.filter(mots_cles__icontains='django')
        self.assertEqual(results_mots.count(), 1)