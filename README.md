# Plateforme de Ressources Académiques

Mini‑application fullstack : backend Django + frontend React (Vite). Permet de publier, modifier, supprimer et consulter des cours/ressources avec upload de fichiers (PDF, etc.) et authentification JWT.

---

## Arborescence principale
- backend/ — configuration Django (settings, urls, auth)
- core/ — application Django (models, views, forms, tests)
- frontend/ — React + Vite (src/, components/, lib/api.ts)
- media/ — fichiers uploadés (MEDIA_ROOT)
- manage.py — commandes Django

---

## Fonctionnalités
- Lister et consulter ressources et cours (endpoints JSON publics).
- Créer / modifier / supprimer cours (auth requis) avec gestion des fichiers (upload, suppression physique).
- Upload de documents lors de la création ou modification (multipart/form-data).
- Authentification via JWT (login endpoint + middleware).
- Frontend : affichage liste, détail, édition et suppression (UI conditionnelle si connecté).

---

## Installation (développement)
Backend
1. Créer et activer un environnement virtuel :
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configurer `backend/settings.py` (SECRET_KEY, MEDIA_ROOT, CORS, CSRF_TRUSTED_ORIGINS).
3. Appliquer migrations :
   ```sh
   python manage.py migrate
   python manage.py createsuperuser   # optionnel
   ```

Frontend
1. Depuis `frontend/` :
   ```sh
   npm ci
   npm run dev
   ```
2. Configurer `.env` (VITE_API_URL si besoin).

---

## Lancer l'application
- Backend :
  ```sh
  python manage.py runserver
  ```
- Frontend (dans `frontend/`) :
  ```sh
  npm run dev
  ```

---

## API (exemples)
Base présumée: `http://127.0.0.1:8000/api/` (adapter VITE_API_URL)

Auth
- POST /api/auth/login/  — { username, password } → { token, username, expires_in }

Courses
- GET  /api/core/courses/            — liste paginée
- POST /api/core/courses/creer/      — créer (multipart ou JSON)
- GET  /api/core/courses/<id>/       — détail
- PUT/PATCH /api/core/courses/<id>/  — modifier (multipart ou JSON)
- DELETE /api/core/courses/<id>/     — supprimer

Ressources (legacy)
- GET  /api/core/ressources/         — listing
- POST /api/core/ressources/creer/   — créer
- etc.

Note : certaines routes sont CSRF exemptes pour usage JWT ; en dev, vérifiez CORS / CSRF_TRUSTED_ORIGINS pour l'origine frontend.

---

## Frontend — points importants
- `frontend/src/lib/api.ts` : fonctions `apiFetch`, `publicFetch`, `listCoursesPublic`, `getCoursePublic`, `deleteCourse`, etc.
- `frontend/src/components/CourseDetail.tsx` : détail, édition et suppression (boutons visibles si connecté).
- `frontend/src/components/AddCourseDialog.tsx` : envoi multipart si des fichiers sont présents, sinon JSON.

---

## Gestion des fichiers
- Uploaded files → `MEDIA_ROOT/courses_docs/` (ou `media/`).
- Lors de suppression d'un cours, le backend tente de supprimer les fichiers physiques référencés par les documents.
- Lors d'une modification, on peut ajouter de nouveaux fichiers et supprimer les anciens (flag `remove_file` ou gestion via UI).

---

## Tests
- Exécuter les tests Django :
  ```sh
  python manage.py test
  ```
- Les tests se trouvent dans `core/tests.py`.

---

## Débogage / erreurs fréquentes
- 302 sur les endpoints → vérifier l'ordre des routes (`backend/urls.py`) et les redirections.
- CSRF Forbidden sur DELETE/PUT → ajouter `CSRF_TRUSTED_ORIGINS` pour le frontend en dev ou utiliser JWT correctement.
- JWT encode/decode : installer `PyJWT` en prod ; un fallback HS256 est fourni en dev.
- Vérifier les logs serveur pour les 500 (logger présent dans `backend/auth_jwt.py`).

---

## Sécurité & production
- Ne pas utiliser `@csrf_exempt` en production sans évaluer le risque.
- Protéger `SECRET_KEY`, configurer HTTPS, lister précisément `CSRF_TRUSTED_ORIGINS` et `CORS_ALLOWED_ORIGINS`.
- Préférer PyJWT pour la gestion des tokens et surveiller l'expiration / révocation.

---

## Contributions
- Améliorer validation des uploads dans `core/forms.py`.
- Ajouter tests frontend et end-to-end.
- Ajouter contrôle d'accès plus fin (rôles/permissions).
- Remplacer les fallbacks JWT par une implémentation standardisée en production.

---

Si tu veux, j'applique ce README directement dans le fichier du dépôt.// filepath: /home/miz/delivery/assurance/plateforme-ressources-academiques/README.md
# Plateforme de Ressources Académiques

Mini‑application fullstack : backend Django + frontend React (Vite). Permet de publier, modifier, supprimer et consulter des cours/ressources avec upload de fichiers (PDF, etc.) et authentification JWT.

---

## Arborescence principale
- backend/ — configuration Django (settings, urls, auth)
- core/ — application Django (models, views, forms, tests)
- frontend/ — React + Vite (src/, components/, lib/api.ts)
- media/ — fichiers uploadés (MEDIA_ROOT)
- manage.py — commandes Django

---

## Fonctionnalités
- Lister et consulter ressources et cours (endpoints JSON publics).
- Créer / modifier / supprimer cours (auth requis) avec gestion des fichiers (upload, suppression physique).
- Upload de documents lors de la création ou modification (multipart/form-data).
- Authentification via JWT (login endpoint + middleware).
- Frontend : affichage liste, détail, édition et suppression (UI conditionnelle si connecté).

---

## Installation (développement)
Backend
1. Créer et activer un environnement virtuel :
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configurer `backend/settings.py` (SECRET_KEY, MEDIA_ROOT, CORS, CSRF_TRUSTED_ORIGINS).
3. Appliquer migrations :
   ```sh
   python manage.py migrate
   python manage.py createsuperuser #optionnel
   ```

Frontend
1. Depuis `frontend/` :
   ```sh
   npm ci
   npm run dev
   ```
2. Configurer `.env` (VITE_API_URL si besoin).

---

## Lancer l'application
- Backend :
  ```sh
  python manage.py runserver
  ```
- Frontend (dans `frontend/`) :
  ```sh
  npm run dev
  ```

---

## API (exemples)
Base présumée: `http://127.0.0.1:8000/api/` (adapter VITE_API_URL)

Auth
- POST /api/auth/login/  — { username, password } → { token, username, expires_in }

Courses
- GET  /api/core/courses/            — liste paginée
- POST /api/core/courses/creer/      — créer (multipart ou JSON)
- GET  /api/core/courses/<id>/       — détail
- PUT/PATCH /api/core/courses/<id>/  — modifier (multipart ou JSON)
- DELETE /api/core/courses/<id>/     — supprimer

Ressources (legacy)
- GET  /api/core/ressources/         — listing
- POST /api/core/ressources/creer/   — créer
- etc.

Note : certaines routes sont CSRF exemptes pour usage JWT ; en dev, vérifiez CORS / CSRF_TRUSTED_ORIGINS pour l'origine frontend.

---

## Frontend — points importants
- `frontend/src/lib/api.ts` : fonctions `apiFetch`, `publicFetch`, `listCoursesPublic`, `getCoursePublic`, `deleteCourse`, etc.
- `frontend/src/components/CourseDetail.tsx` : détail, édition et suppression (boutons visibles si connecté).
- `frontend/src/components/AddCourseDialog.tsx` : envoi multipart si des fichiers sont présents, sinon JSON.

---

## Gestion des fichiers
- Uploaded files → `MEDIA_ROOT/courses_docs/` (ou `media/`).
- Lors de suppression d'un cours, le backend tente de supprimer les fichiers physiques référencés par les documents.
- Lors d'une modification, on peut ajouter de nouveaux fichiers et supprimer les anciens (flag `remove_file` ou gestion via UI).

---

## Tests
- Exécuter les tests Django :
  ```sh
  python manage.py test
  ```
- Les tests se trouvent dans `core/tests.py`.

---

## Débogage / erreurs fréquentes
- 302 sur les endpoints → vérifier l'ordre des routes (`backend/urls.py`) et les redirections.
- CSRF Forbidden sur DELETE/PUT → ajouter `CSRF_TRUSTED_ORIGINS` pour le frontend en dev ou utiliser JWT correctement.
- JWT encode/decode : installer `PyJWT` en prod ; un fallback HS256 est fourni en dev.
- Vérifier les logs serveur pour les 500 (logger présent dans `backend/auth_jwt.py`).

---

## Sécurité & production
- Ne pas utiliser `@csrf_exempt` en production sans évaluer le risque.
- Protéger `SECRET_KEY`, configurer HTTPS, lister précisément `CSRF_TRUSTED_ORIGINS` et `CORS_ALLOWED_ORIGINS`.
- Préférer PyJWT pour la gestion des tokens et surveiller l'expiration / révocation.

---

## Contributions
- Améliorer validation des uploads dans `core/forms.py`.
- Ajouter tests frontend et end-to-end.
- Ajouter contrôle d'accès plus fin (rôles/permissions).
- Remplacer les fallbacks JWT par une implémentation standardisée en production.

---