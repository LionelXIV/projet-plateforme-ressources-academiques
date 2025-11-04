from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.liste_ressources, name='liste'),
    path('detail/<int:pk>/', views.detail_ressource, name='detail'),
    path('download/<int:pk>/', views.telecharger_fichier, name='download'),
    path('api/recherche/', views.api_recherche_simple, name='api_recherche'),
    path('creer/', views.creer_ressource, name='creer'),
    path('modifier/<int:pk>/', views.modifier_ressource, name='modifier'),
    path('supprimer/<int:pk>/', views.supprimer_ressource, name='supprimer'),

    path('courses/creer/', views.create_course, name="creation"),
    path('courses/', views.list_courses, name='courses_list'),
    path('courses/<int:pk>/', views.get_course, name='courses_detail'),
]