import json

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class LoginTest(APITestCase):
    user_class = get_user_model()

    def setUp(self) -> None:
        """
             create a dummy user for testing
        """
        self.user = self.user_class(email="test@user.com")
        self.user.set_password("testpassword")
        self.user.save()

    def test_valid_wrong_credentials(self):
        """
        makes sure that valid but wrong
        credentials get the correct error
        message and status codes
        and test success.
        """
        response = self.client.post('/api/login/', {
            'email': 'test@user.com',  # correct email
            'password': 'bad password',  # wrong password
        }, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['success'], False)
        self.assertEqual(data['errors'], 'user dose not exist')
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_invalid_wrong_credentials(self):
        """
        makes sure that invalid credentials get
        the correct error messages and status codes
        and test success.
        """
        response = self.client.post('/api/login/', {
            'email': "invalid email",  # invalid email
            'password': 'bad password'  # wrong password
        }, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['success'], False)
        self.assertEqual(data['errors']['email'], ['Enter a valid email address.'])
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_valid_good_credentials(self):
        """
        makes sure that valid and correct credentials get the
        no errors the right status codes
        and test success.
        """
        response = self.client.post('/api/login/', {
            'email': 'test@user.com',  # good email
            'password': 'testpassword'  # good password
        }, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 202)
        self.assertEqual(data['success'], True)
        self.assertEqual(data['errors'], {})
        self.assertIn('_auth_user_id', self.client.session)


class LogoutTest(APITestCase):
    user_class = get_user_model()

    def setUp(self) -> None:
        """
        create a dummy user for testing
        """
        self.user = self.user_class(email="test@user.com")
        self.user.set_password("testpassword")
        self.user.save()

    def test_logout_post_with_no_data(self):
        """
        checks if serializer_class for the viewset affects
        the request if data not provided and checks if logout
        view accepts post method
        """
        # authenticates user
        self.client.login(username="test@user.com", password="testpassword")
        # check that user is authenticated
        self.assertIn('_auth_user_id', self.client.session)

        # logs user out using view
        response = self.client.post('/api/logout/')
        data = json.loads(response.content)

        # checks that success is true
        self.assertEqual(data['success'], True)
        # checks status code is 200
        self.assertEqual(response.status_code, 200)
        # checks client is not authenticated
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_logout_post_with_data(self):
        """
        checks if serializer_class for the viewset affects
        the request if data provided if logout
        view accepts post method
        """
        # authenticates user
        self.client.login(username="test@user.com", password="testpassword")
        # check that user is authenticated
        self.assertIn('_auth_user_id', self.client.session)

        # logs user out using view
        response = self.client.post('/api/logout/', {
            'email': 'test@user.com',
            'password': 'testpassword'
        }, format='json')
        data = json.loads(response.content)

        # checks that success is true
        self.assertEqual(data['success'], True)
        # checks status code is 200
        self.assertEqual(response.status_code, 200)
        # checks client is not authenticated
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_logout_get(self):
        """
        checks if logout view accepts get requests
        """
        # authenticates user
        self.client.login(username="test@user.com", password="testpassword")
        # check that user is authenticated
        self.assertIn('_auth_user_id', self.client.session)

        # logs user out using view
        response = self.client.get('/api/logout/')
        data = json.loads(response.content)

        # checks that success is true
        self.assertEqual(data['success'], True)
        # checks status code is 200
        self.assertEqual(response.status_code, 200)
        # checks client is not authenticated
        self.assertNotIn('_auth_user_id', self.client.session)


class TestIsAuthenticated(APITestCase):
    user_class = get_user_model()

    def setUp(self) -> None:
        """
        creates a dummy user for testing authentication
        :return:
        """
        self.user = self.user_class(email="test@user.com")
        self.user.set_password("testpassword")
        self.user.save()

    def test_not_authenticated(self):
        """
        checks if is_authenticated api view
        returns False when client is authenticated
        """
        # check if client logged in using api view
        response = self.client.get('/api/authenticated/')
        data = json.loads(response.content)

        # check if status code 200
        self.assertEqual(response.status_code, 200)
        # check if success True
        self.assertEqual(data['success'], True)
        # check if authenticated False
        self.assertEqual(data['authenticated'], False)

    def test_authenticated(self):
        """
        checks if is_authenticated api view
        returns True when client is authenticated
        """
        # login test client
        self.client.login(email="test@user.com", password="testpassword")
        # check if client is logged in
        self.assertIn('_auth_user_id', self.client.session)

        # check if client logged in using api view
        response = self.client.get('/api/authenticated/')
        data = json.loads(response.content)

        # check status code 200
        self.assertEqual(response.status_code, 200)
        # check success True
        self.assertEqual(data['success'], True)
        # check authenticated True
        self.assertEqual(data['authenticated'], True)
