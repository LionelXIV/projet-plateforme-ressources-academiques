from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.urls import reverse
import json
from unittest.mock import Mock

from backend.profile import views

User = get_user_model()


class ProfileViewsTestCase(TestCase):
    def setUp(self):
        """Crée un utilisateur de test pour chaque test"""
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_get_profile_authenticated(self):
        """Test que l'utilisateur authentifié peut récupérer son profil"""
        request = self.factory.get('/api/profile/')
        request.user = self.user
        
        response = views.get_profile(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['email'], 'test@example.com')
        self.assertEqual(data['first_name'], 'Test')
        self.assertEqual(data['last_name'], 'User')
        self.assertIn('statistics', data)

    def test_get_profile_unauthenticated(self):
        """Test que l'utilisateur non authentifié ne peut pas accéder au profil"""
        request = self.factory.get('/api/profile/')
        from django.contrib.auth.models import AnonymousUser
        request.user = AnonymousUser()
        
        response = views.get_profile(request)
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.content)
        self.assertEqual(data['error'], 'authentication_required')

    def test_update_profile_success(self):
        """Test la mise à jour réussie du profil"""
        update_data = {
            'email': 'newemail@example.com',
            'first_name': 'NewFirst',
            'last_name': 'NewLast'
        }
        request = self.factory.put(
            '/api/profile/update/',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.update_profile(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['email'], 'newemail@example.com')
        self.assertEqual(data['first_name'], 'NewFirst')
        self.assertEqual(data['last_name'], 'NewLast')
        
        # Vérifier que les changements sont persistés
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'newemail@example.com')
        self.assertEqual(self.user.first_name, 'NewFirst')
        self.assertEqual(self.user.last_name, 'NewLast')

    def test_update_profile_email_already_exists(self):
        """Test que l'email déjà utilisé par un autre utilisateur est rejeté"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='pass123'
        )
        update_data = {'email': 'other@example.com'}
        request = self.factory.put(
            '/api/profile/update/',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.update_profile(request)
        self.assertEqual(response.status_code, 409)
        data = json.loads(response.content)
        self.assertEqual(data['error'], 'email_already_exists')

    def test_change_password_success(self):
        """Test le changement de mot de passe réussi"""
        password_data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123'
        }
        request = self.factory.post(
            '/api/profile/change-password/',
            data=json.dumps(password_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.change_password(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        
        # Vérifier que le nouveau mot de passe fonctionne
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))

    def test_change_password_invalid_old_password(self):
        """Test que le mauvais ancien mot de passe est rejeté"""
        password_data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpass123'
        }
        request = self.factory.post(
            '/api/profile/change-password/',
            data=json.dumps(password_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.change_password(request)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['error'], 'invalid_old_password')

    def test_change_password_same_password(self):
        """Test que le même mot de passe est rejeté"""
        password_data = {
            'old_password': 'testpass123',
            'new_password': 'testpass123'
        }
        request = self.factory.post(
            '/api/profile/change-password/',
            data=json.dumps(password_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.change_password(request)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['error'], 'same_password')

    def test_change_password_weak_password(self):
        """Test que un mot de passe trop faible est rejeté"""
        password_data = {
            'old_password': 'testpass123',
            'new_password': '123'  # Trop court
        }
        request = self.factory.post(
            '/api/profile/change-password/',
            data=json.dumps(password_data),
            content_type='application/json'
        )
        request.user = self.user
        
        response = views.change_password(request)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['error'], 'password_validation_failed')

