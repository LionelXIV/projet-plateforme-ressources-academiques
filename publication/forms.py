from django import forms
from .models import Publication

class PublicationForm(forms.ModelForm):
    """
    Formulaire pour créer et modifier une publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    
    class Meta:
        model = Publication
        fields = [
            'titre', 'description', 'mots_cles', 'fichier', 
            'type_contenu', 'matiere', 'universite', 'theme', 'est_publie'
        ]
        widgets = {
            'titre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Titre de la publication'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Description détaillée du contenu'
            }),
            'mots_cles': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Mots-clés séparés par des virgules'
            }),
            'fichier': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf,.doc,.docx,.txt,.mp4,.mp3,.jpg,.jpeg,.png,.ppt,.pptx'
            }),
            'type_contenu': forms.Select(attrs={
                'class': 'form-control'
            }),
            'matiere': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Matière ou cours'
            }),
            'universite': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Université ou établissement'
            }),
            'theme': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Thème ou sujet'
            }),
            'est_publie': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        labels = {
            'titre': 'Titre',
            'description': 'Description',
            'mots_cles': 'Mots-clés',
            'fichier': 'Fichier',
            'type_contenu': 'Type de contenu',
            'matiere': 'Matière',
            'universite': 'Université',
            'theme': 'Thème',
            'est_publie': 'Publier immédiatement'
        }
        help_texts = {
            'mots_cles': 'Séparez les mots-clés par des virgules',
            'fichier': 'Formats acceptés : PDF, DOC, DOCX, TXT, MP4, MP3, JPG, PNG, PPT, PPTX',
            'est_publie': 'Décochez pour sauvegarder comme brouillon'
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Rendre le fichier optionnel
        self.fields['fichier'].required = False
        
        # Ajouter des classes CSS pour le styling
        for field_name, field in self.fields.items():
            if field_name != 'est_publie':
                field.widget.attrs.update({'class': 'form-control'})
    
    def clean_fichier(self):
        """
        Validation du fichier uploadé
        """
        fichier = self.cleaned_data.get('fichier')
        if fichier:
            # Vérifier la taille du fichier (max 50MB)
            if fichier.size > 50 * 1024 * 1024:
                raise forms.ValidationError('Le fichier ne peut pas dépasser 50MB.')
            
            # Vérifier l'extension
            allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.mp4', '.mp3', 
                                '.jpg', '.jpeg', '.png', '.ppt', '.pptx']
            file_extension = fichier.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise forms.ValidationError(
                    f'Format de fichier non supporté. Formats acceptés : {", ".join(allowed_extensions)}'
                )
        
        return fichier
    
    def clean_mots_cles(self):
        """
        Validation des mots-clés
        """
        mots_cles = self.cleaned_data.get('mots_cles')
        if mots_cles:
            # Nettoyer et valider les mots-clés
            mots_cles = mots_cles.strip()
            if len(mots_cles) > 500:
                raise forms.ValidationError('Les mots-clés ne peuvent pas dépasser 500 caractères.')
        return mots_cles
