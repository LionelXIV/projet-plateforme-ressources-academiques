from django.http import JsonResponse
from .ai_generator import generate_quiz

def generate_quiz_view(request):
    theme = request.GET.get("theme")
    if not theme:
        return JsonResponse({"error": "Aucun thème fourni"}, status=400)

    quiz_json, raw = generate_quiz(theme)
    if not quiz_json:
        return JsonResponse({"error": "Impossible de générer le quiz"}, status=500)

    return JsonResponse(eval(quiz_json), safe=False)  # retourne la liste JSON
