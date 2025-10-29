from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse

def home(request):
    """
    Redirige vers la liste centralisée dans l'app core
    """
    return HttpResponseRedirect(reverse('core:liste'))