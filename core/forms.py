from django import forms
from .models import Ressource

class RessourceForm(forms.ModelForm):
    class Meta:
        model = Ressource
        fields = [
            'titre', 'description', 'mots_cles', 'fichier',
            'type_contenu', 'matiere', 'universite', 'theme', 'est_publie'
        ]

    def clean_mots_cles(self):
        mots_cles = self.cleaned_data.get('mots_cles', '') or ''
        if len(mots_cles) > 500:
            raise forms.ValidationError('Les mots-clés ne peuvent pas dépasser 500 caractères.')
        return mots_cles

    def clean_fichier(self):
        fichier = self.cleaned_data.get('fichier')
        if fichier:
            max_size = 50 * 1024 * 1024
            if fichier.size > max_size:
                raise forms.ValidationError('Le fichier ne peut pas dépasser 50MB.')
            allowed_ext = {'.pdf', '.doc', '.docx', '.txt', '.mp4', '.mp3', '.jpg', '.jpeg', '.png', '.ppt', '.pptx'}
            ext = '.' + fichier.name.lower().split('.')[-1]
            if ext not in allowed_ext:
                raise forms.ValidationError(f'Format non supporté ({ext}).')
        return fichier