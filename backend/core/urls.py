from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('courses/creer/', views.create_course, name="creation"),
    path('courses/', views.list_courses, name='courses_list'),
    path('courses/<int:pk>/', views.get_course, name='courses_detail'),
]