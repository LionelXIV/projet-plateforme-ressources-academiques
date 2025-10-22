from django.urls import path
from . import views

app_name = 'publication'

urlpatterns = [
    # Vue pour lister toutes les publications
    path('', views.publication_list, name='list'),
    
    # Vue pour afficher les détails d'une publication
    path('<int:pk>/', views.publication_detail, name='detail'),
    
    # Vue pour créer une nouvelle publication
    path('create/', views.publication_create, name='create'),
    
    # Vue pour modifier une publication existante
    path('<int:pk>/update/', views.publication_update, name='update'),
    
    # Vue pour supprimer une publication
    path('<int:pk>/delete/', views.publication_delete, name='delete'),
    
    # Vue pour afficher les publications de l'utilisateur connecté
    path('my-publications/', views.my_publications, name='my_publications'),
]
