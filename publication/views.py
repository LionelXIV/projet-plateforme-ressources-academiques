from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from .models import Publication
from .forms import PublicationForm

def publication_list(request):
    """
    Vue pour lister toutes les publications
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    # Récupérer toutes les publications publiées
    publications = Publication.objects.filter(est_publie=True).order_by('-date_publication')
    
    # Recherche par mots-clés
    search_query = request.GET.get('search')
    if search_query:
        publications = publications.filter(
            Q(titre__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(mots_cles__icontains=search_query) |
            Q(matiere__icontains=search_query) |
            Q(theme__icontains=search_query)
        )
    
    # Filtrage par type de contenu
    type_filter = request.GET.get('type')
    if type_filter:
        publications = publications.filter(type_contenu=type_filter)
    
    # Filtrage par matière
    matiere_filter = request.GET.get('matiere')
    if matiere_filter:
        publications = publications.filter(matiere__icontains=matiere_filter)
    
    # Pagination
    paginator = Paginator(publications, 12)  # 12 publications par page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'type_filter': type_filter,
        'matiere_filter': matiere_filter,
        'type_choices': Publication.TYPE_CONTENU,
    }
    
    return render(request, 'publication/publication_list.html', context)

def publication_detail(request, pk):
    """
    Vue pour afficher les détails d'une publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    publication = get_object_or_404(Publication, pk=pk, est_publie=True)
    
    # Publications similaires (même matière)
    similar_publications = Publication.objects.filter(
        matiere=publication.matiere,
        est_publie=True
    ).exclude(pk=pk)[:4]
    
    context = {
        'publication': publication,
        'similar_publications': similar_publications,
    }
    
    return render(request, 'publication/publication_detail.html', context)

@login_required
def publication_create(request):
    """
    Vue pour créer une nouvelle publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    if request.method == 'POST':
        form = PublicationForm(request.POST, request.FILES)
        if form.is_valid():
            publication = form.save(commit=False)
            publication.auteur = request.user
            publication.save()
            messages.success(request, 'Publication créée avec succès !')
            return redirect('publication:detail', pk=publication.pk)
    else:
        form = PublicationForm()
    
    context = {
        'form': form,
        'title': 'Créer une publication',
    }
    
    return render(request, 'publication/publication_form.html', context)

@login_required
def publication_update(request, pk):
    """
    Vue pour modifier une publication existante
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    publication = get_object_or_404(Publication, pk=pk)
    
    # Vérifier que l'utilisateur est l'auteur ou un admin
    if publication.auteur != request.user and not request.user.is_staff:
        messages.error(request, 'Vous ne pouvez pas modifier cette publication.')
        return redirect('publication:detail', pk=pk)
    
    if request.method == 'POST':
        form = PublicationForm(request.POST, request.FILES, instance=publication)
        if form.is_valid():
            form.save()
            messages.success(request, 'Publication modifiée avec succès !')
            return redirect('publication:detail', pk=pk)
    else:
        form = PublicationForm(instance=publication)
    
    context = {
        'form': form,
        'publication': publication,
        'title': 'Modifier la publication',
    }
    
    return render(request, 'publication/publication_form.html', context)

@login_required
def publication_delete(request, pk):
    """
    Vue pour supprimer une publication
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    publication = get_object_or_404(Publication, pk=pk)
    
    # Vérifier que l'utilisateur est l'auteur ou un admin
    if publication.auteur != request.user and not request.user.is_staff:
        messages.error(request, 'Vous ne pouvez pas supprimer cette publication.')
        return redirect('publication:detail', pk=pk)
    
    if request.method == 'POST':
        publication.delete()
        messages.success(request, 'Publication supprimée avec succès !')
        return redirect('publication:list')
    
    context = {
        'publication': publication,
    }
    
    return render(request, 'publication/publication_confirm_delete.html', context)

def user_login(request):
    """
    Vue de connexion simple pour les utilisateurs
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'Bienvenue, {user.username} !')
            return redirect('publication:list')
        else:
            messages.error(request, 'Nom d\'utilisateur ou mot de passe incorrect.')
    
    return render(request, 'publication/login.html')