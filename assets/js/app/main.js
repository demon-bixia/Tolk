import {Router} from "./silly/router.js";
import {Communicator} from "./silly/communication.js"
import {Wizard} from './silly/effects.js'
import {load} from './load.js'
import {emptyForm, openFirstConversation, removeFormErrorEvent, renderFormErrors, scrollChat} from "./utility.js";


let communicator = new Communicator(Router);
let wizard = new Wizard();
let preloader = document.querySelector('.loader');

(function main() {
    eva.replace(); // replace icons no imported

    communicator.send_ajax({'route_name': 'authenticated'}).then(function (data) {

        let authenticated_user = data['authenticated_user'];

        if (data['is_authenticated']) {
            // get authenticated contact and load all
            communicator.send_ajax({'route_name': 'contact-detail', 'args': [authenticated_user['contact']]})
                .then(function (data) {

                    // load all site
                    load('chat-app', {'authenticated_contact': data['contact']})
                        .then(function () {
                            // attach all events
                            AddEventListeners();
                            // activate a conversation
                            let first_conversation = openFirstConversation();
                            // scroll chat for first conversation
                            scrollChat(first_conversation);
                            // hide preoader
                            wizard.hide(preloader);
                        })
                        .then(function () {
                            // connect to chat socket
                            communicator.connect_socket('chat-socket').then(function () {
                                communicator.on_receive = receive;

                                joinConversations();
                                getStatuses();
                            })
                        })
                })
        } else {
            AddAuthEventListeners();
            // show login and register logic
            wizard.show(document.querySelector('#Login'));
            wizard.hide(preloader);
        }
    })
})();

function AddEventListeners() {
    // when info button is clicked open utility
    document.querySelector('.chat .tab-content')
        .addEventListener('click', toggleUtilityEvent);

    // when account update form is submitted send contact update request
    document.querySelector('#account form.account')
        .addEventListener('submit', updateAccountEvent);

    // when clicking create button in modal submit form
    document.querySelector('#create .modal-footer button')
        .addEventListener('click', conversationCreateEvent);

    // when writing in and input element remove error class from form-group
    document.querySelector('body')
        .addEventListener('input', removeFormErrorEvent);

    // when logout button clicked logout
    document.querySelector('#Logout')
        .addEventListener('click', logoutEvent);

    // when conversation bubble is clicked open
    // chat
    document.querySelector('#conversations .container')
        .addEventListener('click', openChat);

    // when close button is clicked close chat
    document.querySelector('.chat')
        .addEventListener('click', closeChat);

    // when clicking in the profile picture of a chat toggle utility
    document.querySelector('.chat')
        .addEventListener('click', openUtility);

    // when send button is clicked send message
    document.querySelector('.chat')
        .addEventListener('click', sendMessageEvent);

    for (let chat of document.querySelectorAll('.chat .tab-content .tab-pane')) {
        // when enter is clicked send button
        chat.querySelector('.bottom form textarea.form-control')
            .addEventListener('keyup', sendMessageEnterEvent);
    }

    // when conversation bubble is clicked scroll
    // chat to bottom
    document.querySelector('#conversations .container')
        .addEventListener('click', scrollChatEvent);
}

function AddAuthEventListeners() {
    // when register link clicked in login modal
    // switch to register modal
    document.querySelector('#Login .switch-register')
        .addEventListener('click', () => {
            wizard.hide(document.querySelector('#Login'));
            wizard.hide(document.querySelector('#Created'));
            wizard.show(document.querySelector('#Register'));
        });

    // when login link clicked on created modal
    // switch to login modal
    document.querySelector('#Created .switch-login')
        .addEventListener('click', () => {
            wizard.hide(document.querySelector('#Register'));
            wizard.hide(document.querySelector('#Created'));
            wizard.show(document.querySelector('#Login'));
        });

    // when login link clicked on register modal
    // switch to login modal
    document.querySelector('#Register .switch-login')
        .addEventListener('click', () => {
            wizard.hide(document.querySelector('#Register'));
            wizard.hide(document.querySelector('#Created'));
            wizard.show(document.querySelector('#Login'));
        });


    // when login button is clicked preform login event
    document.querySelector('#Login  .modal-footer .button[data-target="#login-form"]')
        .addEventListener('click', loginEvent);

    // when register button is clicked preform register event
    document.querySelector('#Register .modal-footer .button[data-target="#register-form"]')
        .addEventListener('click', registerEvent);

    // when writing in and input element remove error class from form-group
    document.querySelector('body')
        .addEventListener('input', removeFormErrorEvent);
}

function toggleUtilityEvent(event) {
    let target = event.target;
    let button = target.closest('button');

    if (button && button.dataset['utility']) {
        wizard.toggle(document.querySelector(`.chat #${button.dataset['conversation']} .utility`));
    }
}

function updateAccountEvent(event) {
    event.preventDefault();
    let form = this;
    let formData = new FormData(form);

    let file = form['contact_pic'].files[0]; // get file inside html input

    if (file) {
        formData.append('group_header', file); // put file inside multipart form data
    }

    let contact_id = form.dataset['contact'];

    // toggle preloader before send
    wizard.show(preloader);

    communicator.send_ajax({
        'route_name': 'contact-partial-update',
        'args': [contact_id],
        'data': formData,
        'type': false,
    }).then(function (data) {
        // get authenticated contact and load all
        communicator.send_ajax({'route_name': 'contact-detail', 'args': [contact_id]})
            .then(function (data) {
                // load affected parts
                load('conversations', {'refresh': true, 'authenticated_contact': data['contact']}).then(function () {
                    return load('account-update-form', {
                        'refresh': true,
                        'authenticated_contact': data['contact']
                    }).then(function (element) {
                        return load('contact-picture', {'refresh': true, 'authenticated_contact': data['contact']});
                    }).then(function () {
                        AddEventListeners();
                        // remove preloader
                        wizard.hide(preloader);
                        // empty form
                        emptyForm(form);
                    }).then(function () {
                        if (communicator.socket_is_open()) {
                            getNotifications();
                        }
                    })
                })
            })
    }, function (response) {
        console.error(`server responded with a ${response['status']}`);

        if (response.status === 413) {
            renderFormErrors(form, {'contact_pic': ['file too large to process',]});
        } else {
            renderFormErrors(form, response['data']);
        }
        wizard.hide(preloader);
    });
}

function conversationCreateEvent(event) {
    event.preventDefault();
    let form = document.querySelector('#create .modal-body .tab-content .tab-pane.active form');

    if (form.getAttribute('id') === 'account-form') {
        addFriend(form);
    } else if (form.getAttribute('id') === 'group-create') {
        createGroup(form);
    }
}

// when create button is clicked and
// group create is open send create
// conversation event
function addFriend(form) {
    let formData = new FormData(form);
    let data = {
        'email': formData.get('email'),
    };


    let contact_id = form.dataset['contact'];

    // show preloader
    wizard.show(preloader);

    communicator.send_ajax({'route_name': 'add-friend', 'data': data})
        .then(function (res) {
            if (res['success']) {
                // send notification to user
                // update parts affected
                communicator.send_ajax({'route_name': 'contact-detail', 'args': [contact_id]})
                    .then(function (data) {
                        // close modal
                        $('#create').modal('hide');

                        load('conversation-create-form', {
                            'refresh': true,
                            'authenticated_contact': data['contact']
                        }).then(function (element) {
                            return load('conversations', {
                                'refresh': true,
                                'authenticated_contact': data['contact']
                            });
                        }).then(function (element) {
                            return load('friends', {'refresh': true, 'authenticated_contact': data['contact']});
                        }).then(function (element) {
                            return load('chat', {'refresh': true, 'authenticated_contact': data['contact']});
                        }).then(function (element) {
                            AddEventListeners();
                            // open first conversation
                            openFirstConversation();
                            // empty form
                            emptyForm(form);
                            // hide preloader
                            wizard.hide(preloader);
                        }).then(function () {
                            // check if socket is connected
                            // send event if true
                            if (communicator.socket_is_open()) {
                                // send a STATUSES EVENT
                                joinConversations(res['conversation']['name']);
                                getStatuses();
                                getNotifications();
                            }
                        })
                    })
            } else {
                // render errors
                renderFormErrors(form, res['data']['errors']);
                wizard.hide(preloader);
            }
        }, function (response) {
            console.log(`request error status: error: ${response['status']}`);
            // render form error
            renderFormErrors(form, response['data']['errors']);
            wizard.hide(preloader);
        })
}

// when create button is clicked and
// group create is open send create
// group event
function createGroup(form) {
    let formData = new FormData(form);
    let file = form['group_header'].files[0]; // get file inside html input

    if (file) {
        formData.append('group_header', file); // put file inside multipart form data
    }

    // show preloader
    wizard.show(preloader);

    communicator.send_ajax({
        'route_name': 'create-group',
        'type': false,
        'data': formData,
    }).then(function (response) {
        // if request.status_code is 200 +
        // check if success is true

        if (response['success'] === true) {
            $('#create').modal('hide');

            let contact_id = form.dataset['contact'];
            communicator.send_ajax({'route_name': 'contact-detail', 'args': [contact_id]})
                .then(function (data) {
                    load('conversation-create-form', {
                        'refresh': true,
                        'authenticated_contact': data['contact'],
                    }).then(function (element) {
                        return load('conversations', {
                            'refresh': true,
                            'authenticated_contact': data['contact']
                        });
                    }).then(function (element) {
                        return load('friends', {'refresh': true, 'authenticated_contact': data['contact']});
                    }).then(function (element) {
                        return load('chat', {
                            'refresh': true,
                            'authenticated_contact': data['contact'],
                        })
                    }).then(function (element) {
                        AddEventListeners();
                        // open the first conversation because chat section is reloaded
                        openFirstConversation();
                        //empty create group form
                        emptyForm(form);
                        // hide the preloader element
                        wizard.hide(preloader);
                    }).then(function () {
                        if (communicator.socket_is_open()) {
                            getStatuses();
                            joinConversation(response['conversation']['name']);
                            getNotifications();
                        }
                    })
                })
        } else {
            // show form errors
            renderFormErrors(form, response['data']['errors']);
            wizard.hide(preloader);
        }
    }, function (response) {
        // if status code is 400
        // show form errors
        console.error(response['status']);
        if (response['status'] === 413) {
            // show form errors
            renderFormErrors(form, {'group_header': 'file too large to process'});
        } else {
            // show form errors
            renderFormErrors(form, response['data']['errors']);
        }
        // hide preloader elements
        wizard.hide(preloader);
    })
}

// when logout button is clicked
// send logout request
function logoutEvent(event) {
    wizard.show(preloader);

    communicator.send_ajax({'route_name': 'logout'}).then(function (response) {
        AddAuthEventListeners();
        wizard.show(document.querySelector('#Login'));
        wizard.hide(preloader);
    }).then(function () {
        communicator.disconnect_socket(); // close socket connection
    })
}

// should use preloader
// when deployed
function loginEvent(event) {
    event.preventDefault();

    let form = document.querySelector('#login-form');
    let formData = new FormData(form);

    wizard.show(preloader);

    communicator.send_ajax({
        'route_name': 'login',
        'type': false,
        'data': formData,
    }).then(function (response) {
        // if request is successful
        communicator.send_ajax({'route_name': 'authenticated'}).then(function (data) {

            if (data['is_authenticated']) {

                // get authenticated contact and load all
                communicator.send_ajax({
                    'route_name': 'contact-detail',
                    'args': [data['authenticated_user']['contact']]
                })
                    .then(function (data) {
                        // load all site
                        load('chat-app', {'authenticated_contact': data['contact'], 'refresh': true})
                            .then(function () {
                                // attach all events
                                AddEventListeners();
                                // activate a conversation
                                let first_conversation = openFirstConversation();
                                // scroll chat of first conversation
                                scrollChat(first_conversation);
                                // hide login modal
                                wizard.hide(document.querySelector('#Login'));
                                // empty the login form
                                emptyForm(form);
                                // hide preloader element
                                wizard.hide(preloader);
                            })
                            .then(function () {
                                // connect to chat socket
                                communicator.connect_socket('chat-socket').then(function () {
                                    communicator.on_receive = receive;

                                    joinConversations();
                                    getStatuses();
                                    getNotifications();
                                })
                            })
                    })
            }
        })

    }, function (response) {
        // if request not successful show form errors
        renderFormErrors(form, response['data']['errors']);
        wizard.hide(preloader);
    })
}

// should use preloader
// when deployed
function registerEvent(event) {
    event.preventDefault();

    let form = document.querySelector('#register-form');
    let formData = new FormData(form);

    wizard.show(preloader);

    communicator.send_ajax({
        'route_name': 'register',
        'type': false,
        'data': formData

    }).then(function (response) {
        // empty register form
        emptyForm(form);
        wizard.switchTo(document.querySelector('#Created'), [document.querySelector('#Register')]);
        wizard.hide(preloader);

    }, function (response) {
        renderFormErrors(form, response['data']['errors']);
        wizard.hide(preloader);

    });
}

// when conversation bubble is clicked
// add open class to chat
function openChat(event) {
    let element = event.target.closest('.filter.direct');
    if (element) {
        let chat = document.querySelector('.chat');
        chat.classList.add('open');
    }
}

// when back button is clicked
// remove open from chat
function closeChat(event) {
    let element = event.target;
    if (element.classList.contains('close-chat') || element.parentElement.classList.contains('close-chat')) {
        let chat = document.querySelector('.chat');
        chat.classList.remove('open');
        document.querySelector('#conversations .nav li a.active').classList.remove('active');
    }
}

// when profile picture is clicked
// open utility section
function openUtility(event) {
    let element = event.target;

    if (element.classList.contains('headline') ||
        element.parentElement.classList.contains('headline') ||
        element.parentElement.parentElement.classList.contains('headline')) {
        let headline = element.closest('.headline');
        wizard.toggle(document.querySelector(`#conversation_${headline.dataset['conversation']} .utility`));
    }
}

// when a chat is opened scroll to
// bottom of chat
function scrollChatEvent(event) {
    let element = event.target.closest('.filter.direct');

    if (element) {
        // find chat for given conversation
        let chat_id = element.getAttribute('href');
        let chat_list = document.querySelector(`${chat_id} .scroll`);
        let scroll_height = chat_list.scrollHeight;
        chat_list.scrollBy(0, scroll_height);
    }
}

// join all conversations
function joinConversations() {
    let conversations = document.querySelectorAll('#conversations .discussion li');

    for (let conversation of conversations) {
        let conversation_name = conversation.querySelector('a').dataset['name'];
        communicator.send_json_socket({'command': 'JOIN', 'conversation_name': conversation_name});
    }
}

// join a conversation
function joinConversation(conversation_name) {
    communicator.send_json_socket({'command': 'JOIN', 'conversation_name': conversation_name});
}

// when send button is clicked
// send message
function sendMessageEvent(event) {
    if (event.target.classList.contains('send') || event.target.parentElement.classList.contains('send')) {
        let input = event.target.closest('form')['message'];
        let conversation_name = input.dataset['conversation'];
        sendMessage(input, conversation_name)
    }
}

// send message when enter is clicked
function sendMessageEnterEvent(event) {
    event.preventDefault();

    if (event.code === 'Enter' || event.code === 'Return') {
        let conversation_name = event.target.dataset['conversation'];
        sendMessage(event.target, conversation_name);
    }
}

// send message
function sendMessage(input, conversation_name) {
    if (input.value !== '' && input.value.length >= 1 && input.value.trim().length !== 0) {
        communicator.send_json_socket({
            'command': 'MESSAGE',
            'conversation_name': conversation_name,
            'message': input.value
        });
    } else {
        input.value = '';
    }
}

// get the status of all friends
function getStatuses() {
    communicator.send_json_socket({'command': 'STATUSES'});
}

function getNotifications() {
    communicator.send_json_socket({'command': 'NOTIFICATION'})
}

/* Websocket Callbacks */
function receive(data) {
    let json_data = JSON.parse(data);

    switch (json_data['command']) {
        case 'MESSAGE':
            conversation_message(json_data);
            break;
        case 'JOIN':
            conversation_joined(json_data);
            break;
        case 'LEAVE':
            conversation_left(json_data);
            break;
        case 'STATUSES':
            conversation_statuses(json_data);
            break;
        case 'STATUS':
            conversation_status(json_data);
            break;
        case 'NOTIFICATION':
            conversation_notification(json_data);
            break;
    }
}

function conversation_message(data) {
    load('message', data).then(function () {
        return load('bubble-last-message', data);
    }).then(function () {
        let conversation = document.querySelector(`#conversations  a[data-name="${data['conversation_name']}"]`);
        scrollChat(conversation);
    })
}

function conversation_joined(data) {
    console.info(`${data['conversation_name']} joined`);
}

function conversation_left(data) {

    console.info(`${data['conversation_name']} left`);
}

function conversation_statuses(data) {
    /*
    * changes the status span in chats and utility
    * */
    for (let user of Object.keys(data['statuses'])) {
        let conversation = document.querySelector(`.chat .tab-content .tab-pane[data-user="${user}"]`);

        // make sure that the conversation exists
        if (conversation) {
            let top_status = conversation.querySelector('.top .headline span');
            let bottom_status = conversation.querySelector('.utility .profile span');

            if (data['statuses'][`${user}`] === 'active') {
                // find the active status in head and change it
                top_status.innerHTML = 'Active Now';
                // find the active status in utility and change it
                bottom_status.innerHTML = 'Active Now';

                // make the color of the status green
                top_status.classList.add('active');
                // make the color of the status green
                bottom_status.classList.add('active');
            } else {
                // find the active status in head and change it
                top_status.innerHTML = 'Offline';
                // find the active status in utility and change it
                bottom_status.innerHTML = 'Offline';
                // remove the green color from the status
                top_status.classList.remove('active');
                // remove the green color from the status
                bottom_status.classList.remove('active');
            }
        }
    }
}

function conversation_status(data) {
    let conversation = document.querySelector(`.chat .tab-content .tab-pane[data-user="${data['user']}"]`);

    if (conversation) {
        let top_status = conversation.querySelector('.top .headline span');
        let bottom_status = conversation.querySelector('.utility .profile span');

        if (data['status'] === 'active') {
            top_status.innerHTML = 'Active Now';
            // find the active status in utility and change it
            bottom_status.innerHTML = 'Active Now';

            // make the color of the status green
            top_status.classList.add('active');
            // make the color of the status green
            bottom_status.classList.add('active');
        } else {
            // find the active status in head and change it
            top_status.innerHTML = 'Offline';
            // find the active status in utility and change it
            bottom_status.innerHTML = 'Offline';

            // remove the green color from the status
            top_status.classList.remove('active');
            // remove the green color from the status
            bottom_status.classList.remove('active');
        }
    }
}

function conversation_notification(data) {
    load('notifications', {'notification': data['notification'], 'refresh': true})
        .then(function () {
            let audio = document.querySelector('.notifications-sound');
            try {
                audio.play();
            } catch (e) {
                console.log('notifications are muted until you interact with the document');
            }
            eva.replace();
        })
}
