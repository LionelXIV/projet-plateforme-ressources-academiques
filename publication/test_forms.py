from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
from .forms import PublicationForm
from .models import Publication

class PublicationFormTest(TestCase):
    """
    Tests pour le formulaire PublicationForm
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.valid_data = {
            'titre': 'Test Publication',
            'description': 'Description de test pour la publication',
            'mots_cles': 'test, django, publication',
            'type_contenu': 'pdf',
            'matiere': 'Informatique',
            'universite': 'UQAR',
            'theme': 'Django Testing',
            'est_publie': True
        }
    
    def test_form_valid_data(self):
        """Test du formulaire avec des données valides"""
        form = PublicationForm(data=self.valid_data)
        self.assertTrue(form.is_valid())
    
    def test_form_required_fields(self):
        """Test des champs obligatoires"""
        # Test sans titre
        data_no_titre = self.valid_data.copy()
        del data_no_titre['titre']
        form = PublicationForm(data=data_no_titre)
        self.assertFalse(form.is_valid())
        self.assertIn('titre', form.errors)
        
        # Test sans description
        data_no_description = self.valid_data.copy()
        del data_no_description['description']
        form = PublicationForm(data=data_no_description)
        self.assertFalse(form.is_valid())
        self.assertIn('description', form.errors)
        
        # Test sans type_contenu
        data_no_type = self.valid_data.copy()
        del data_no_type['type_contenu']
        form = PublicationForm(data=data_no_type)
        self.assertFalse(form.is_valid())
        self.assertIn('type_contenu', form.errors)
    
    def test_form_file_validation(self):
        """Test de validation des fichiers"""
        # Test avec fichier valide
        valid_file = SimpleUploadedFile(
            "test.pdf",
            b"file_content",
            content_type="application/pdf"
        )
        data_with_file = self.valid_data.copy()
        data_with_file['fichier'] = valid_file
        
        form = PublicationForm(data=data_with_file, files={'fichier': valid_file})
        self.assertTrue(form.is_valid())
        
        # Test avec fichier trop volumineux
        large_file = SimpleUploadedFile(
            "large.pdf",
            b"x" * (51 * 1024 * 1024),  # 51MB
            content_type="application/pdf"
        )
        data_large_file = self.valid_data.copy()
        data_large_file['fichier'] = large_file
        
        form = PublicationForm(data=data_large_file, files={'fichier': large_file})
        self.assertFalse(form.is_valid())
        self.assertIn('fichier', form.errors)
    
    def test_form_file_extension_validation(self):
        """Test de validation des extensions de fichier"""
        # Test avec extension non autorisée
        invalid_file = SimpleUploadedFile(
            "test.exe",
            b"file_content",
            content_type="application/octet-stream"
        )
        data_invalid_file = self.valid_data.copy()
        data_invalid_file['fichier'] = invalid_file
        
        form = PublicationForm(data=data_invalid_file, files={'fichier': invalid_file})
        self.assertFalse(form.is_valid())
        self.assertIn('fichier', form.errors)
    
    def test_form_mots_cles_validation(self):
        """Test de validation des mots-clés"""
        # Test avec mots-clés trop longs
        data_long_mots = self.valid_data.copy()
        data_long_mots['mots_cles'] = 'x' * 501  # Plus de 500 caractères
        
        form = PublicationForm(data=data_long_mots)
        self.assertFalse(form.is_valid())
        self.assertIn('mots_cles', form.errors)
    
    def test_form_type_contenu_choices(self):
        """Test des choix de type de contenu"""
        form = PublicationForm()
        type_field = form.fields['type_contenu']
        
        # Vérifier que les choix sont présents
        expected_choices = [
            ('pdf', 'PDF'),
            ('video', 'Vidéo'),
            ('audio', 'Audio'),
            ('texte', 'Texte'),
            ('image', 'Image'),
            ('presentation', 'Présentation'),
        ]
        self.assertEqual(list(type_field.choices), expected_choices)
    
    def test_form_widgets_and_labels(self):
        """Test des widgets et labels du formulaire"""
        form = PublicationForm()
        
        # Vérifier les labels
        self.assertEqual(form.fields['titre'].label, 'Titre')
        self.assertEqual(form.fields['description'].label, 'Description')
        self.assertEqual(form.fields['mots_cles'].label, 'Mots-clés')
        
        # Vérifier les widgets
        self.assertEqual(form.fields['titre'].widget.attrs['class'], 'form-control')
        self.assertEqual(form.fields['description'].widget.attrs['class'], 'form-control')
        self.assertEqual(form.fields['mots_cles'].widget.attrs['class'], 'form-control')
    
    def test_form_help_texts(self):
        """Test des textes d'aide"""
        form = PublicationForm()
        
        self.assertIn('Séparez les mots-clés par des virgules', form.fields['mots_cles'].help_text)
        self.assertIn('Formats acceptés', form.fields['fichier'].help_text)
        self.assertIn('Décochez pour sauvegarder comme brouillon', form.fields['est_publie'].help_text)
    
    def test_form_save_method(self):
        """Test de la méthode save du formulaire"""
        form = PublicationForm(data=self.valid_data)
        self.assertTrue(form.is_valid())
        
        publication = form.save(commit=False)
        publication.auteur = self.user
        publication.save()
        
        self.assertEqual(publication.titre, 'Test Publication')
        self.assertEqual(publication.auteur, self.user)
        self.assertTrue(publication.est_publie)
    
    def test_form_with_existing_instance(self):
        """Test du formulaire avec une instance existante"""
        # Créer une publication existante
        existing_publication = Publication.objects.create(
            titre='Publication existante',
            description='Description existante',
            mots_cles='existant',
            type_contenu='pdf',
            matiere='Informatique',
            universite='UQAR',
            theme='Django',
            auteur=self.user,
            est_publie=False
        )
        
        # Modifier avec le formulaire
        data_modified = self.valid_data.copy()
        data_modified['titre'] = 'Publication modifiée'
        data_modified['est_publie'] = True
        
        form = PublicationForm(data=data_modified, instance=existing_publication)
        self.assertTrue(form.is_valid())
        
        updated_publication = form.save()
        self.assertEqual(updated_publication.titre, 'Publication modifiée')
        self.assertTrue(updated_publication.est_publie)
        self.assertEqual(updated_publication.pk, existing_publication.pk)
    
    def test_form_optional_file_field(self):
        """Test que le champ fichier est optionnel"""
        form = PublicationForm(data=self.valid_data)
        self.assertTrue(form.is_valid())
        
        # Le fichier ne devrait pas être requis
        self.assertFalse(form.fields['fichier'].required)
    
    def test_form_clean_methods(self):
        """Test des méthodes clean personnalisées"""
        # Test clean_mots_cles avec données valides
        form = PublicationForm(data=self.valid_data)
        if form.is_valid():
            cleaned_mots = form.clean_mots_cles()
            self.assertEqual(cleaned_mots, 'test, django, publication')
        
        # Test clean_mots_cles avec espaces
        data_with_spaces = self.valid_data.copy()
        data_with_spaces['mots_cles'] = '  test, django  '
        form = PublicationForm(data=data_with_spaces)
        if form.is_valid():
            cleaned_mots = form.clean_mots_cles()
            self.assertEqual(cleaned_mots, 'test, django')
