/*
* an object containing routes that are used to
* communicate with server using various protocols
* */
export let routes = {
    // accounts routes
    'contact-list': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/contacts/',
    },

    'contact-detail': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': `/api/contacts/<pk>/`,

    },

    'contact-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/contacts/',
    },

    'contact-update': {
        'protocol': 'http',
        'method': 'PUT',
        'url_pattern': `/api/contacts/<pk>/`,
    },

    'contact-partial-update': {
        'protocol': 'http',
        'method': 'PATCH',
        'url_pattern': '/api/contacts/<pk>/',
    },

    'add-friend': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/add-friend/',
    },

    'contact-delete': {
        'protocol': 'http',
        'method': 'DELETE',
        'url_pattern': '/api/contact/<pk>/',
    },

    'user-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/users/',
    },

    'user-update': {
        'protocol': 'http',
        'method': 'PUT',
        'url_pattern': '/api/users/<pk>/',
    },

    'user-partial': {
        'protocol': 'http',
        'method': 'PATCH',
        'url_pattern': '/api/users/<pk>/',
    },

    'user-delete': {
        'protocol': 'http',
        'method': 'DELETE',
        'url_pattern': '/api/users/<pk>/',
    },

    'register': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/register/',
    },

    // authentication routes
    'login': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/login/',
    },

    'logout': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/logout/',
    },

    'authenticated': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/authenticated/'
    },

    // chat app routes
    // conversations
    'conversation-list': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/conversations/'
    },

    'conversation-detail': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/conversations/<pk>/'
    },

    'conversation-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/conversations/'
    },

    'conversation-update': {
        'protocol': 'http',
        'method': 'PUT',
        'url_pattern': '/api/conversations/<pk>/'
    },

    'conversation-partial-update': {
        'protocol': 'http',
        'method': 'PATCH',
        'url_pattern': '/api/conversations/<pk>/'
    },

    'conversation-delete': {
        'protocol': 'http',
        'method': 'DELETE',
        'url_pattern': '/api/conversations/<pk>/'
    },

    'create-group': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/create-group/'
    },

    // notifications
    'notification-list': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/notifications/'
    },

    'notification-detail': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/notifications/<pk>/'
    },

    'notification-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/notifications/'
    },

    'notification-update': {
        'protocol': 'http',
        'method': 'PUT',
        'url_pattern': '/api/notifications/<pk>/'
    },

    'notification-partial-update': {
        'protocol': 'http',
        'method': 'PATCH',
        'url_pattern': '/api/notifications/<pk>/'
    },

    'notification-delete': {
        'protocol': 'http',
        'method': 'DELETE',
        'url_pattern': '/api/notifications/<pk>/'
    },

    // messages
    'message-list': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/messages/'
    },

    'message-detail': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/messages/<pk>/'
    },

    'message-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/messages/'
    },

    'message-update': {
        'protocol': 'http',
        'method': 'PUT',
        'url_pattern': '/api/messages/<pk>/'
    },

    'message-partial-update': {
        'protocol': 'http',
        'method': 'PATCH',
        'url_pattern': '/api/messages/<pk>/'
    },

    'message-delete': {
        'protocol': 'http',
        'method': 'DELETE',
        'url_pattern': '/api/messages/<pk>/'
    },

    'send-attachment': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/send-attachments/',
    },

    // settings
    'settings-detail': {
        'protocol': 'http',
        'method': 'GET',
        'url_pattern': '/api/settings/<pk>/'
    },

    'settings-create': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/settings/'
    },

    'change-settings': {
        'protocol': 'http',
        'method': 'POST',
        'url_pattern': '/api/change-settings/',
    },

    'chat-socket': {
        'protocol': 'websockets',
        'url': '/ws/chat/',
    }
};
