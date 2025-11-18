from django.urls import path
from .views import generate_quiz_view

urlpatterns = [
    path("generate-quiz/", generate_quiz_view, name="generate-quiz"),
]
