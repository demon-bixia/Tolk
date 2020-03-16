import json
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Contact


# test user api
class TestUserAPI(APITestCase):
    user_class = get_user_model()

    def create_test_user(self):
        """
        create a dummy user for testing
        """
        user = self.user_class(email="test@user.com")
        user.set_password("testpassword")
        user.save()

        contact = Contact(first_name='test', last_name='user', location='test city', user=user)
        contact.save()

        return user

    def test_user_create_invalid_data(self):
        """
        checks if invalid data get the correct
        error messages that is serializer errors
        """

        response = self.client.post('/api/users/', {
            'email': 'bad email',
            'password': 'password',
        })

        data = json.loads(response.content)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['email'], ['Enter a valid email address.'])

    def test_user_creation(self):
        """
        checks if user is created and saved in db
        """
        # create new user
        response = self.client.post('/api/users/', {
            'email': 'test@user.com',
            'password': 'testpassword',
        })
        # render response
        data = json.loads(response.content)
        # fetch user from database
        user = self.user_class(email='test@user.com')
        # check if status code is 200
        self.assertEqual(response.status_code, 201)
        # check if user is created
        self.assertEqual(data['user']['email'], user.email)
        # check if password is hashed
        self.assertNotEqual('testpassword', user.password)

    def test_user_update_invalid_data(self):
        """
        checks if update fails with invalid data
        """
        # create a dummy user for testing
        test_user = self.create_test_user()

        self.client.force_login(test_user)

        response = self.client.put(f'/api/users/{test_user.id}/', {
            'email': 'invalid email',
            'password': 'p',
        })

        data = json.loads(response.content)
        self.assertEqual(response.status_code, 400)
        # check if client gets the correct success value
        self.assertEqual(data.get('success'), None)
        self.assertEqual(data['email'], ['Enter a valid email address.'])

    def test_user_update(self):
        """
        checks if user is updated
        in db
        """
        # create a dummy user for testing
        self.create_test_user()

        response = self.client.put('/api/users/1/', {
            'email': 'test@newuser.com',
            'password': 'newtestpassword',
        })
        data = json.loads(response.content)
        # check if status code is 200
        self.assertEqual(response.status_code, 200)
        # check if client gets the correct success value
        self.assertEqual(data.get('success'), True)
        # check if instance updated
        self.assertEqual(data['user']['email'], 'test@newuser.com')

        # query db for users with new email
        user = self.user_class.objects.filter(email="test@newuser.com").first()
        # check if user updated in db
        self.assertIsNotNone(user)

    def test_user_delete(self):
        """
        tests if user is deleted
        """
        # create a dummy user for testing
        self.create_test_user()

        # delete user
        response = self.client.delete('/api/users/1/')
        data = json.loads(response.content)
        # query db for users with deleted id
        user = self.user_class.objects.filter(id=1).first()

        # check if status code is 200
        self.assertEqual(response.status_code, 200)
        # check if client gets the correct success value
        self.assertEqual(data.get('success'), True)
        # check if user exist in db
        self.assertIsNone(user)

    def test_user_list(self):
        """
        checks if a list of user is returned
        """
        # create a dummy user for testing
        self.create_test_user()

        # fetch a list of all users
        response = self.client.get('/api/users/')
        data = json.loads(response.content)

        # check if status code is 200
        self.assertEqual(response.status_code, 200)
        # check is returned a list
        self.assertEqual(type(data['users']), list)

    def test_user_retreive(self):
        """
        checks if user is retreived
        """
        # create a dummy user for testing
        self.create_test_user()

        # fetch a single user
        response = self.client.get('/api/users/1/')
        data = json.loads(response.content)

        # check if status code is 200
        self.assertEqual(response.status_code, 200)
        # check is user is exists
        self.assertIsNotNone(data['user'])


class TestContactAPI(APITestCase):
    """
    tests contact api
    """
    user_class = get_user_model()
    contact_class = Contact

    def setUp(self) -> None:
        """
        create a user for contacts
        """
        self.user = self.user_class(email="test@user.com")
        self.user.set_password("testpassword")
        self.user.save()

    def create_test_contact(self):
        contact = self.contact_class(
            first_name='test',
            last_name='user',
            location='London UK',
            user=self.user
        )
        contact.save()
        return contact

    def test_create(self):
        """
        checks if contact is created
        and saved to db
        """
        with open('/home/muhammad/Pictures/wallhaven-ne2m88.jpg', "rb") as fp:
            response = self.client.post('/api/contacts/', {
                "first_name": "test",
                "last_name": "user",
                "location": "London UK",
                "user": f"/api/users/{self.user.pk}/",
                "contact_pic": fp,
            })
            data = json.loads(response.content)
            contact = self.contact_class.objects.filter(user_id=self.user.pk).first()

            self.assertEqual(response.status_code, 201)
            self.assertIsNotNone(contact)

    def test_create_invalid(self):
        """
        checks if invalid data get rejected
        """

        with open('/home/muhammad/Pictures/wallhaven-ne2m88.jpg', "rb") as fp:
            response = self.client.post('/api/contacts/', {
                "first_name": "test",  # missing last name
                "location": 1,
                "user": f"/api/users/{self.user.pk}/",
                "contact_pic": fp,
            })
            data = json.loads(response.content)

            self.assertEqual(response.status_code, 400)
            self.assertEqual(data['last_name'], ['This field is required.'])

    def test_update(self):
        """
        checks if full contact is updated
        and changed in db
        """
        contact = self.create_test_contact()
        with open('/home/muhammad/Pictures/wallhaven-ne2m88.jpg', "rb") as fp:
            response = self.client.put('/api/contacts/1/', {
                "first_name": "test",
                "last_name": "user",
                "location": "London UK",
                "user": f"/api/users/{self.user.pk}/",
                "contact_pic": fp,
            })
            data = json.loads(response.content)
            contact = Contact.objects.filter(user_id=contact.user.id).first()

            self.assertEqual(response.status_code, 200)
            self.assertIsNotNone(contact)

    def test_update_invalid_data(self):
        contact = self.create_test_contact()
        with open('/home/muhammad/Pictures/wallhaven-ne2m88.jpg', "rb") as fp:
            response = self.client.put('/api/contacts/1/', {
                "last_name": "name",
                "location": "London UK",
                "user": f"/api/users/{self.user.pk}/",
                "contact_pic": fp,
            })
            data = json.loads(response.content)
            contact = Contact.objects.filter(user_id=contact.user.id).first()

            self.assertEqual(response.status_code, 400)
            self.assertEqual(data['first_name'], ['This field is required.'])

    def test_partial_update(self):
        """
        checks if a single value in contact
        is created and changed in db
        """
        contact = self.create_test_contact()

        with open('/home/muhammad/Pictures/wallhaven-ne2m88.jpg', "rb") as fp:
            response = self.client.patch(f'/api/contacts/{contact.pk}/', {
                "contact_pic": fp,
            })
            data = json.loads(response.content)
            updated_contact = Contact.objects.filter(user_id=contact.user.id).first()

            self.assertEqual(response.status_code, 200)
            self.assertIsNotNone(updated_contact)

    def test_delete(self):
        """
        checks if contact is deleted
        and removed from db
        """
        contact = self.create_test_contact()
        response = self.client.delete(f'/api/contacts/{contact.pk}/')
        data = json.loads(response.content)
        deleted_contact = self.contact_class.objects.filter(pk=contact.pk).first()

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(deleted_contact)

    def test_retreive(self):
        """
        test if a single contact is fetched
        """
        contact = self.create_test_contact()
        response = self.client.get(f'/api/contacts/{contact.pk}/')
        data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(data['contact'])

    def test_list(self):
        """
        test if a list of contacts is fetched
        """
        response = self.client.get(f'/api/contacts/')
        data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(type(data['contacts']), list)
