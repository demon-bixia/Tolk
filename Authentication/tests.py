from django.test import TestCase
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class TestAuthentication(TestCase):

    def setUp(self) -> None:
        self.user = User.objects.create_user(email='guest_1@user.com')
        self.user.set_password('password')
        self.user.save()

    def test_bad_credentials(self):
        response = self.client.post('/api/login/', data={'email': 'guest_1user.com', 'password': 'bad password'})
        self.assertEqual(response.status_code, 400)

        is_authenticated = self.client.get('/api/authenticated/').data['is_authenticated']
        self.assertFalse(is_authenticated)

    def test_user_authentication(self):
        response = self.client.post('/api/login/', data={'email': 'guest_1@user.com', 'password': 'password'})
        self.assertEqual(response.status_code, 202)
        is_authenticated = self.client.get('/api/authenticated/').data['is_authenticated']
        self.assertTrue(is_authenticated)
