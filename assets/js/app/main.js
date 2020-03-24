import {Router} from "./silly/router.js";
import {Communicator} from "./silly/communication.js"
import {Wizard} from './silly/effects.js'
import {load} from './load.js'
import {
    changeTheme,
    emptyForm,
    openFirstConversation,
    removeFormErrorEvent,
    renderFormErrors,
    scrollChat
} from "./utility.js";


let communicator = new Communicator(Router);
let wizard = new Wizard();
let preloader = document.querySelector('.loader');
let b_preloader = document.querySelector('.b-preloader');
let message_audio = document.querySelector('.message-sound');
let siteLoaded = false;

(function main() {
    startUp();

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
                            // change theme cookie
                            if (document.querySelector('#appearance-settings .switch input').checked) {
                                Cookies.set('theme', 'dark');
                                changeTheme(true);
                            } else {
                                Cookies.set('theme', 'light');
                                changeTheme(false);
                            }
                            if (window.screen.width > 991) {
                                // activate a conversation
                                let first_conversation = openFirstConversation();
                                // scroll chat for first conversation
                                scrollChat(first_conversation);
                            }
                            // hide preloader
                            wizard.hide(preloader);
                            siteLoaded = true;
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
            // change theme
            let theme = Cookies.get('theme') === 'dark';
            changeTheme(theme);
            // show login and register logic
            wizard.show(document.querySelector('#Login'));
            wizard.hide(preloader);
            siteLoaded = true;
        }
    })
})();

function startUp() {
    Velocity(document.querySelector('.b-preloader img'), {'display': 'block', "opacity": 1}, {
        duration: 2500,
        easing: 'easeInOutQuad'
    });

    Velocity(document.querySelector('.b-preloader .progress .progress-bar'), {'width': '100%'}, {
        duration: 2000,
        delay: 1500,
        easing: 'easeInOutQuad',
    }).then(function () {
        setInterval(hideBPreloader, 1500)
    });
}

function hideBPreloader() {
    if (siteLoaded) {
        wizard.hide(b_preloader);
        clearInterval(hideBPreloader);
    }
}


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

    // when a setting switch is clicked change settings
    document.querySelector('.settings #preferences')
        .addEventListener('click', changeSettings);

    // when inputting any thing to the search form in the top
    // sidebar section call filter the conversations
    document.querySelector('.sidebar .top .form-control')
        .addEventListener('input', filterEvent);

    // when moving away from the current sidebar tab reset filters
    document.querySelector('.navigation .nav')
        .addEventListener('click', navigationSwitchEvent);

    // when settings button is clicked in sidebar top
    // menu open settings tap
    document.querySelector('.sidebar .top .dropdown-menu button:nth-child(2)')
        .addEventListener('click', OpenSettingsEvent);

    // when logout button is clicked inside the sidebar top
    // menu logout of site
    document.querySelector('.sidebar .top .dropdown-menu button:nth-child(3)')
        .addEventListener('click', logoutEvent)
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

    if (form.getAttribute('id') === 'group-form') {
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
                            return load('chats', {'refresh': true, 'authenticated_contact': data['contact']});
                        }).then(function (element) {
                            AddEventListeners();
                            if (window.screen.width > 991) {
                                // open first conversation
                                openFirstConversation();
                            }
                            // empty form
                            emptyForm(form);
                            // hide preloader
                            wizard.hide(preloader);
                        }).then(function () {
                            // check if socket is connected
                            // send event if true
                            if (communicator.socket_is_open()) {
                                // send a STATUSES EVENT
                                joinConversation(res['conversation']['id']);
                                getStatuses();
                                getNotifications();
                                notify_participants(res['conversation']['id'])
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
                        return load('chats', {
                            'refresh': true,
                            'authenticated_contact': data['contact'],
                        })
                    }).then(function (element) {
                        AddEventListeners();
                        if (window.screen.width > 991) {
                            // open the first conversation because chat section is reloaded
                            openFirstConversation();
                        }
                        //empty create group form
                        emptyForm(form);
                        // hide the preloader element
                        wizard.hide(preloader);
                    }).then(function () {
                        if (communicator.socket_is_open()) {
                            joinConversation(response['conversation']['id']);
                            getStatuses();
                            getNotifications();
                            notify_participants(response['conversation']['id'])
                        }
                    })
                })
        } else {
            // show form errors
            renderFormErrors(form, response['errors']);
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

// when a settings switch is clicked send
// settings-changed event
function changeSettings(event) {
    let element = event.target;

    if (element.classList.contains('slider')) {
        let input = element.parentElement.querySelector('input[type="checkbox"]');
        let requestData = {
            'setting': input.name,
            'value': !input.checked,
        };

        communicator.send_ajax({
            'route_name': 'change-settings',
            'data': requestData,
        }).then(function (res_data) {
            if (input.name === 'night_mode') {
                if (res_data['data']['night_mode']) {
                    changeTheme(true);
                    Cookies.set('theme', 'dark');
                } else {
                    changeTheme(false);
                    Cookies.set('theme', 'light');
                }
            }
        })
    }
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
                                if (window.screen.width > 991) {
                                    // activate a conversation
                                    let first_conversation = openFirstConversation();
                                    // scroll chat of first conversation
                                    scrollChat(first_conversation);
                                }
                                // change theme
                                if (document.querySelector('#appearance-settings .switch input').checked) {
                                    Cookies.set('theme', 'dark');
                                    changeTheme(true);
                                } else {
                                    Cookies.set('theme', 'light');
                                    changeTheme(false);
                                }
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

// when settings button is clicked inside
// sidebar top menu  open settings
function OpenSettingsEvent() {
    let setting_button = document.querySelector('.navigation .nav li:nth-child(5) a');
    setting_button.click();
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

let tab_links = ['#conversation', '#friends', '#notifications', '#settings'];

function navigationSwitchEvent(event) {
    let element = event.target;
    if (element.tagName === 'A' || element.parentElement.tagName === 'A' || element.parentElement.parentElement.tagName === 'A') {
        let opened_nav = document.querySelector('.navigation .nav a.active');
        let target = opened_nav.getAttribute('href');

        // reset filter for previously opened tab
        resetSearch(opened_nav);

        if (tab_links.includes(element.getAttribute('href'))) {
            // add opened to the new active tab
            if (element.tagName === 'A') {
                element.classList.add('opened')
            } else {
                element.closest('A').classList.add('opened');
            }
        }
    }
}

function resetSearch(opened_nav) {
    let openSection = document.querySelector(`${opened_nav.getAttribute('href')}`);

    switch (openSection.getAttribute('id')) {
        case 'conversations':
            conversationReset();
            break;
        case 'friends':
            friendsReset();
            break;
        case 'notifications':
            notificationsReset();
            break;
        case 'settings':
            settingsReset();
            break;
    }
}

function conversationReset() {
    let conversations = document.querySelectorAll('#conversations .nav li');
    if (conversations) {
        for (let conversation of conversations) {
            conversation.style.display = 'list-item';
        }
    }
}

function friendsReset() {
    let friends = document.querySelectorAll('#friends .users li');
    if (friends) {
        for (let friend of friends) {
            friend.style.display = 'list-item';
        }
    }
}

function notificationsReset() {
    let notifications = document.querySelectorAll('#notifications .notifications li');
    if (notifications) {
        for (let notification of notifications) {
            notification.style.display = 'flex';
        }
    }
}

function settingsReset() {
    let settings_tabs = document.querySelectorAll('#settings #preferences li');
    for (let settings_tab of settings_tabs) {
        let settings_contents = settings_tab.querySelectorAll('.content.collapse');
        for (let setting_content of settings_contents) {
            setting_content.classList.remove('show');
        }
    }
}

function filterEvent(event) {
    let value = this.value;
    let openSection = document.querySelector('.sidebar .middle .tab-pane.active');

    switch (openSection.getAttribute('id')) {
        case 'conversations':
            filterConversations(value);
            break;
        case 'friends':
            filterFriends(value);
            break;
        case 'notifications':
            filterNotification(value);
            break;
        case 'settings':
            filterSettings(value);
            break;
    }
}

function filterConversations(value) {
    let conversations = document.querySelectorAll('#conversations .nav li');
    let regx = new RegExp(`${value}`, 'ig');

    if (conversations) {

        for (let conversation of conversations) {
            let conversation_name = conversation.querySelector('.headline h5').innerHTML;


            if (value.trim().length !== 0) {
                if (conversation_name.match(regx)) {
                    conversation.style.display = 'list-item';
                } else {
                    conversation.style.display = 'none';
                }
            } else {
                conversation.style.display = 'list-item';
            }
        }
    }
}

function filterFriends(value) {
    let friends = document.querySelectorAll('#friends .users li');
    let regx = new RegExp(`${value}`, 'ig');

    if (friends) {
        for (let friend of friends) {
            let friend_name = friend.querySelector('.content h5');
            let friend_location = friend.querySelector('.content span');

            if (value.trim().length !== 0) {
                if (friend_name.innerText.match(regx) || friend_location.innerText.match(regx)) {
                    friend.style.display = 'list-item';
                } else {
                    friend.style.display = 'none';
                }
            } else {
                friend.style.display = 'list-item';
            }
        }
    }
}

function filterNotification(value) {
    let notifications = document.querySelectorAll('#notifications .notifications li');
    let regx = new RegExp(`${value}`, 'ig');

    if (notifications) {
        for (let notification of notifications) {
            let notification_content = notification.querySelector('p').innerText;

            if (value.trim().length !== 0) {
                if (notification_content.match(regx)) {
                    notification.style.display = 'flex';
                } else {
                    notification.style.display = 'none';
                }
            } else {
                notification.style.display = 'flex';
            }
        }
    }
}

function filterSettings(value) {
    let settings_tabs = document.querySelectorAll('#settings #preferences li');
    let regx = new RegExp(`${value}`, 'ig');
    let opened = false;

    if (settings_tabs) {
        for (let settings_tab of settings_tabs) {
            let settings_contents = settings_tab.querySelectorAll('.content.collapse');
            for (let setting_content of settings_contents) {
                if (setting_content.getAttribute('id') !== 'account') {
                    let options = setting_content.querySelectorAll('.options li');
                    for (let option of options) {
                        let name = option.querySelector('.headline h5');
                        if (value.trim().length !== 0) {
                            if (name.innerText.match(regx)) {
                                name.classList.add('highlight');

                                if (!opened) {
                                    setting_content.classList.add('show');
                                } else {
                                    setting_content.classList.remove('show');
                                }

                            } else {
                                name.classList.remove('highlight');
                                setting_content.classList.remove('show');
                            }
                        } else {
                            name.classList.remove('highlight');
                            setting_content.classList.remove('show');
                        }
                    }
                }
            }
        }
    }
}


// join all conversations
function joinConversations() {
    let conversations = document.querySelectorAll('#conversations .discussion li');

    for (let conversation of conversations) {
        let conversation_id = conversation.querySelector('a').dataset['id'];
        communicator.send_json_socket({'command': 'JOIN', 'id': conversation_id});
    }
}

// join a conversation
function joinConversation(conversation_id) {
    communicator.send_json_socket({'command': 'JOIN', 'id': conversation_id});
}

// when send button is clicked
// send message
function sendMessageEvent(event) {
    if (event.target.classList.contains('send') || event.target.parentElement.classList.contains('send')) {
        let input = event.target.closest('form')['message'];
        let conversation_id = input.dataset['conversation'];
        sendMessage(input, conversation_id)
    }
}

// send message when enter is clicked
function sendMessageEnterEvent(event) {
    event.preventDefault();

    if (event.code === 'Enter' || event.code === 'Return') {
        let conversation_id = event.target.dataset['conversation'];
        sendMessage(event.target, conversation_id);
    }
}

// send message
function sendMessage(input, conversation_id) {
    if (input.value !== '' && input.value.length >= 1 && input.value.trim().length !== 0) {
        communicator.send_json_socket({
            'command': 'MESSAGE',
            'id': conversation_id,
            'message': input.value
        });
        input.value = '';
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

// called when
function notify_participants(conversation_id) {
    communicator.send_json_socket({
        'command': 'CONVERSATION',
        'id': conversation_id,
    })
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
        case 'CONVERSATION':
            conversation_added(json_data);
            break;
    }
}

function conversation_message(data) {
    load('message', data).then(function () {
        return load('bubble-last-message', data);
    }).then(function () {
        let conversation = document.querySelector(`#conversations  a[data-id="${data['conversation_id']}"]`);
        scrollChat(conversation);
    }).then(function () {
        message_audio.play();
    })
}

function conversation_joined(data) {
    console.info(`conversations_${data['conversation_id']} joined`);
}

function conversation_left(data) {

    console.info(`conversation_${data['conversation_id']} left`);
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

function conversation_added(data) {
    let emptyChat = document.querySelector('.chat .tab-content .empty-chat');
    let open_first = false;

    if (emptyChat) {
        open_first = true
    }

    load('conversation', data).then(function (element) {
        return load('chat', data)

    }).then(function () {
            AddEventListeners();
            if (open_first) {
                if (window.screen.width > 991) {
                    openFirstConversation();
                }
            }
        }
    ).then(function (element) {
        // join new conversation
        // and get statuses
        if (communicator.socket_is_open()) {
            joinConversation(data['conversation']['id']);
            getStatuses();
            getNotifications();
        }
    })
}
