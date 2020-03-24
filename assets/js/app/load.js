import {Renderer} from "./silly/renderer.js";
import {ComponentFactory} from "./silly/component_lib.js";
import {Router} from "./silly/router.js";
import {Communicator} from "./silly/communication.js"

let communicator = new Communicator(Router);
let renderer = new Renderer(ComponentFactory);

export function load(command, options) {

    switch (command) {
        case 'contact-picture':
            return loadContactPicture(options);

        case 'conversations':
            return loadConversations(options);

        case 'conversation':
            return loadConversation(options);

        case 'chat':
            return loadChat(options);

        case 'friends':
            return loadFriends(options);

        case 'chats':
            return loadChats(options);

        case 'settings':
            return loadSettings(options);

        case 'notifications':
            return loadNotifications(options).then(function () {
                eva.replace();
            });

        case 'conversation-create-form':
            return loadConversationCreateForm(options).then(function () {
                eva.replace();
            });

        case 'account-update-form':
            return loadAccountUpdateForm(options);

        case 'chat-app':
            return loadContactPicture(options).then(function (element) {
                return loadConversations(options)
            }).then(function (element) {
                return loadNotifications(options)
            }).then(function (element) {
                return loadFriends(options)
            }).then(function (element) {
                return loadChats(options)
            }).then(function (element) {
                return loadConversationCreateForm(options)
            }).then(function (element) {
                return loadAccountUpdateForm(options)
            }).then(function (element) {
                return loadSettings(options)
            }).then(function (element) {
                eva.replace();
            });

        case 'message':
            return loadMessage(options);

        case 'bubble-last-message':
            return loadConversationBubbleLastMessage(options);

        case 'notification':
            return loadNotification(options);

    }
}

function loadNotification(options) {
    return renderer.render({
        'component_name': 'notification-bubble',
        'refresh': options['refresh'],
        'data': {
            'notification': options['notification'],
        }
    })
}

function loadMessage(options) {
    let authenticated_user = document.querySelector('.profile-container img').dataset['user'];
    let conversation = document.querySelector(`#conversations  a[data-id="${options['conversation_id']}"]`);
    let chat_id = conversation.getAttribute('href');

    return renderer.render({
        'component_name': 'message',
        'container': `${chat_id} .middle ul`,
        'data': {'message': options, 'authenticated_user': authenticated_user}
    });
}

function loadConversationBubbleLastMessage(options) {
    return renderer.render({
        'component_name': 'bubble-last-message',
        'selector': `#conversations a[data-id="${options['conversation_id']}"] .content p`,
        'data': {'message': options}
    });
}

function loadContactPicture(options) {
    return renderer.render({
        'component_name': 'contact-picture',
        'refresh': options['refresh'],
        'data': {'contact': options['authenticated_contact']}
    });
}

function loadConversations(options) {
    // get a list of joined conversations
    return communicator.send_ajax({
        'route_name': 'conversation-list',
        'type': 'application/json',
    }).then(function (data) {
        return renderer.render({
            'component_name': 'conversations-list',
            'refresh': options['refresh'],
            'data': {
                'conversations': data['conversations'],
                'authenticated_contact': options['authenticated_contact'],
                'authenticated_user': options['authenticated_user'],
            }
        })
    })
}

function loadConversation(options) {
    let container = document.querySelector('#conversations .nav');
    if (container) {
        return renderer.render({
            'component_name': 'conversation-bubble',
            'container': '#conversations .nav',
            'data': options,
        })
    } else {
        return renderer.render({
            'component_name': 'first-conversation-bubble',
            'data': options,
        })
    }
}

function loadChat(options) {
    let emptyChat = document.querySelector('.chat .tab-content .empty-chat');

    if (!emptyChat) {
        return renderer.render({
            'component_name': 'chat',
            'container': '.chat .tab-content',
            'data': options,
        })
    } else {
        return renderer.render({
            'component_name': 'first-chat',
            'data': options,
        })
    }

}

function loadChats(options) {
    return communicator.send_ajax({'route_name': 'conversation-list'}).then(function (data) {
        return renderer.render({
            'component_name': 'chats-list',
            'refresh': options['refresh'],
            'data': {
                'conversations': data['conversations'],
                'authenticated_contact': options['authenticated_contact']
            }
        })
    })
}

function loadFriends(options) {
    return communicator.send_ajax({'route_name': 'contact-list'}).then(function (data) {
        return renderer.render({
            'component_name': 'friends-list',
            'refresh': options['refresh'],
            'data': {
                'contacts': data['contacts'],
                'authenticated_contact': options['authenticated_contact'],
            }
        })
    })
}

function loadNotifications(options) {
    return communicator.send_ajax({'route_name': 'notification-list'}).then(function (data) {
        return renderer.render({
            'component_name': 'notifications-list',
            'refresh': options['refresh'],
            'data': {
                'notifications': data['notifications'],
            }
        })
    })
}

function loadSettings(options) {
    return communicator.send_ajax({
        'route_name': 'settings-detail',
        'args': [options['authenticated_contact']['settings']]
    })
        .then(function (data) {
            return renderer.render({
                'component_name': 'privacy-switch',
                'refresh': options['refresh'],
                'data': {'settings': data['settings']}
            }).then(function () {
                return renderer.render({
                    'component_name': 'theme-switch',
                    'refresh': options['refresh'],
                    'data': {'settings': data['settings']}
                });
            }).then(function () {
                return renderer.render({
                    'component_name': 'notifications-switch',
                    'refresh': options['refresh'],
                    'data': {'settings': data['settings']}
                })
            })
        })
}

function loadAccountUpdateForm(options) {

    return renderer.render({
        'component_name': 'contact-update-form',
        'refresh': options['refresh'],
        'data': {'contact': options['authenticated_contact']},
    })
}

function loadConversationCreateForm(options) {

    return communicator.send_ajax({'route_name': 'contact-list'}).then(function (data) {
        return renderer.render({
            'component_name': 'conversation-create-form',
            'refresh': options['refresh'],
            'data': {
                'authenticated_contact': options['authenticated_contact'],
                'contacts': data['contacts'],
            }
        })
    })
}
