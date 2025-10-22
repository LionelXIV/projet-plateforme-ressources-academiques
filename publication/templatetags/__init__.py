from django import template

register = template.Library()

@register.filter
def split(value, delimiter):
    """
    Filtre personnalisé pour diviser une chaîne selon un délimiteur
    Utilisé pour les mots-clés dans les templates
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    if value:
        return value.split(delimiter)
    return []

@register.filter
def strip(value):
    """
    Filtre pour supprimer les espaces en début et fin
    """
    if value:
        return value.strip()
    return value
