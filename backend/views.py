from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse

def home(request):
    """
    Vue d'accueil simple qui redirige vers les publications
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    return HttpResponseRedirect(reverse('publication:list'))
