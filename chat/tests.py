# Create your tests here.
import json
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from accounts.models import User, Contact
from .models import Conversation, Message, Notification


class TestConversationAPI(APITestCase):

    def setUp(self) -> None:
        pass

    def create_test_conversation(self):
        conversation = Conversation.objects.create(name='test', type='couple')
        conversation.save()
        return conversation

    def test_create(self):
        path = reverse('conversation-list')
        # send a valid request
        good_response = self.client.post(path, {
            'name': 'tech talk',
            'type': 'couple',
        })

        # send an invalid request
        bad_response = self.client.post(path, {
            'name': '623fe5f1d9cac3a233502be68ec7cd43e24b8d053b792d58801c7294c4bc',
            'type': 'fake type',
            'participants': [
                "http://testserver/api/contacts/13/",
                "http://testserver/api/contacts/14/",
            ],
            'contacts': [
                "http://testserver/api/messages/1/",
                "http://testserver/api/messages/2/"
            ],
            'last_message': '',
            'last_message_date': 'Today',
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        new_conversation = Conversation.objects.filter(name="tech talk").first()

        self.assertEqual(good_response.status_code, 201)
        self.assertTrue(good_response_data.get('success', False), True)
        self.assertIsNotNone(new_conversation)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False), False)

    def test_update(self):
        conversation = self.create_test_conversation()

        path = reverse('conversation-detail', str(conversation.pk))

        good_response = self.client.put(path, {
            'name': 'tech talk',
            'type': 'group',
        })

        bad_response = self.client.put(path, {
            'name': 'a233502be68ec7cd43e24b8d053b792d58801c7294c4bc',
            'type': 'fake type',
            'participants': [
                "http://testserver/api/contacts/13/",
                "http://testserver/api/contacts/14/",
            ],
            'contacts': [
                "http://testserver/api/messages/1/",
                "http://testserver/api/messages/2/"
            ],
            'last_message': '',
            'last_message_date': 'Today',
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_conversation = Conversation.objects.filter(name='tech talk').first()

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_conversation)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False))

    def test_partial_update(self):
        conversation = self.create_test_conversation()

        path = reverse('conversation-detail', str(conversation.pk))

        good_response = self.client.patch(path, {
            'name': 'tech talk',
        })

        bad_response = self.client.patch(path, {
            'name': 'a233502be68ec7cd43e24b8d053b792d58801c7294c4bc',
            'participants': [
                "http://testserver/api/contacts/13/",
                "http://testserver/api/contacts/14/",
            ],
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_conversation = Conversation.objects.filter(name='tech talk').first()

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_conversation)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False))

    def test_destroy(self):
        conversation = self.create_test_conversation()
        path = reverse('conversation-detail', str(conversation.pk))

        self.client.delete(path)

        deleted_conversation = Conversation.objects.filter(name='tech talk').first()

        self.assertIsNone(deleted_conversation)


class TestMessageAPI(APITestCase):

    def create_test_user(self, email, password):
        user = User.objects.create(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_test_contact(self, first_name, last_name, location, user):
        contact = Contact.objects.create(first_name=first_name,
                                         last_name=last_name,
                                         location=location,
                                         user=user)
        contact.save()
        return contact

    def create_test_conversation(self, name=None, _type=None):
        conversation = Conversation.objects.create(name=name, type=_type)
        conversation.save()
        return conversation

    def create_test_message(self, content, contact, conversation):
        message = Message.objects.create(content=content, sender=contact, conversation=conversation)
        message.save()
        return message

    def setUpCase(self):
        user_1 = self.create_test_user('test1@email.com', 'test_password')
        user_2 = self.create_test_user('test2@email.com', 'test_password')

        contact_1 = self.create_test_contact('test1', 'user1', 'test', user_1)
        contact_2 = self.create_test_contact('test2', 'user2', 'test', user_2)

        conversation = self.create_test_conversation(name='test chat', _type='couple')

        conversation.participants.add(contact_1)
        conversation.participants.add(contact_2)

        message = self.create_test_message(content="hey there", contact=contact_1, conversation=conversation)

        return {
            'message': message,
            'user_1': user_2,
            'user_2': user_2,
            'contact_1': contact_1,
            'contact_2': contact_2,
            'conversation': conversation
        }

    def test_create(self):
        case_args = self.setUpCase()

        path = reverse('message-list')

        good_response = self.client.post(path, {
            'content': 'im fine',
            'sender': f'http://testserver/api/contacts/{case_args["contact_2"].id}/',
            'conversation': f'http://testserver/api/conversations/{case_args["conversation"].id}/',
        })

        bad_response = self.client.post(path, {
            'content': 1,
            'sender': case_args["contact_1"].id,
            'conversation': case_args["conversation"].id,
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        new_message = Message.objects.filter(sender=case_args['contact_2'].id, content='im fine').first()

        self.assertEqual(good_response.status_code, 201)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(new_message)

        self.assertEqual(bad_response.status_code, 400)

    def test_update(self):
        case_args = self.setUpCase()

        path = reverse('message-detail', f'{case_args["message"].pk}')

        good_response = self.client.put(path, {
            'content': 'im fine',
            'sender': f'http://testserver/api/contacts/{case_args["contact_2"].id}/',
            'conversation': f'http://testserver/api/conversations/{case_args["conversation"].id}/',
        })

        bad_response = self.client.put(path, {
            'content': 1,
            'sender': case_args["contact_1"].id,
            'conversation': case_args["conversation"].id,
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_message = Message.objects.filter(sender=case_args['contact_2'].id, content='im fine').first()

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_message)

        self.assertEqual(bad_response.status_code, 400)

    def test_partial_update(self):
        case_args = self.setUpCase()

        path = reverse('message-detail', f'{case_args["message"].pk}')

        good_response = self.client.patch(path, {
            'content': 'im fine',
        })

        bad_response = self.client.patch(path, {
            'content': 1,
            'sender': case_args["contact_1"].id,
            'conversation': case_args["conversation"].id,
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_message = Message.objects.filter(sender=case_args['contact_1'].id, content='im fine').first()

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_message)

        self.assertEqual(bad_response.status_code, 400)

    def test_delete(self):
        case_args = self.setUpCase()

        path = reverse('message-detail', f'{case_args["message"].pk}')

        self.client.patch(path, {
            'content': 'im fine',
        })

        deleted_message = Message.objects.filter(sender=case_args['contact_1'].id, content='hey there').first()
        self.assertIsNone(deleted_message)


class TestNotificationsAPI(APITestCase):

    def create_test_user(self, email, password):
        user = User.objects.create(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_test_contact(self, first_name, last_name, location, user):
        contact = Contact.objects.create(first_name=first_name,
                                         last_name=last_name,
                                         location=location,
                                         user=user)
        contact.save()
        return contact

    def create_test_notifications(self, content, contact):
        notifications = Notification.objects.create(content=content, contact=contact)
        notifications.save()
        return notifications

    def setUpCase(self):
        user = self.create_test_user('test1@email.com', 'test_password')
        contact = self.create_test_contact('test1', 'user1', 'test', user)
        notification = self.create_test_notifications(content="testing", contact=contact)

        return {
            'contact': contact,
            'notification': notification,
        }

    def test_create(self):
        case_args = self.setUpCase()

        path = reverse('notification-list')

        good_response = self.client.post(path, {
            'contact': f"http://testserver/api/contacts/{case_args['contact'].id}/",
            'content': 'hey your food is ready',
            'type': 'chat',
        })

        bad_response = self.client.post(path, {
            'contact': path + str(case_args['contact'].id) + '/',
            'type': 'wrong type',
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        new_notifications = Notification.objects.filter(content='hey your food is ready',
                                                        contact_id=case_args['contact'].id)

        self.assertEqual(good_response.status_code, 201)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(new_notifications)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False))

    def test_update(self):
        case_args = self.setUpCase()

        path = reverse('notification-detail', str(case_args['notification'].id))

        good_response = self.client.put(path, {
            'contact': f"http://testserver/api/contacts/{case_args['contact'].id}/",
            'content': 'hey your food is ready',
            'type': 'chat',
        })

        bad_response = self.client.put(path, {
            'contact': path + str(case_args['contact'].id) + '/',
            'type': 'wrong type',
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_notifications = Notification.objects.filter(content='hey your food is ready',
                                                            contact_id=case_args['contact'].id)

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_notifications)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False))

    def test_partial_update(self):
        case_args = self.setUpCase()

        path = reverse('notification-detail', str(case_args['notification'].id))

        good_response = self.client.patch(path, {
            'content': 'hey your food is ready',
        })

        bad_response = self.client.patch(path, {
            'contact': path + str(case_args['contact'].id) + '/',
            'type': 'wrong type',
        })

        good_response_data = json.loads(good_response.content)
        bad_response_data = json.loads(bad_response.content)

        updated_notifications = Notification.objects.filter(content='hey your food is ready').first()

        self.assertEqual(good_response.status_code, 200)
        self.assertTrue(good_response_data.get('success', False))
        self.assertIsNotNone(updated_notifications)

        self.assertEqual(bad_response.status_code, 400)
        self.assertFalse(bad_response_data.get('success', False))

    def test_delete(self):
        case_args = self.setUpCase()

        path = reverse('notification-detail', str(case_args['notification'].id))

        good_response = self.client.delete(path)

        deleted_notifications = Notification.objects.filter(content=case_args['notification'].content).first()

        self.assertIsNone(deleted_notifications)
