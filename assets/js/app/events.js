/* events.js
*  events and handlers for this site
*  */
import {load} from "./load.js";

import {communicator, wizard} from "./init.js";

import {
    changeTheme,
    emptyForm,
    openFirstConversation,
    removeFormErrorEvent,
    renderFormErrors,
    scrollChat,
    filterConversations,
    filterFriends,
    filterNotification,
    filterSettings,
    switchTabs,
    toggleSettings,
} from "./interface.js";

import {
    joinConversation,
    addFriend,
    getNotifications,
    getStatuses,
    joinConversations,
    notify_participants,
    sendMessage,
} from "./chat.js";

let message_audio = document.querySelector('.message-sound');
let preloader = document.querySelector('.loader');

// setup event callbacks for authenticated users
export function AddEventListeners() {
    // when info button is clicked open utility
    document.querySelector('.chat .tab-content')
        .addEventListener('click', toggleUtilityEvent);

    // when account update form is submitted send contact update request
    document.querySelector('#account form.account')
        .addEventListener('submit', updateAccountEvent);

    // when contact add form submits
    document.querySelector('#create #contact-form')
        .addEventListener('submit', addFriendEvent);

    // when group create form submits
    document.querySelector('#create #group-create')
        .addEventListener('submit', createGroupEvent);


    // when a contact link is clicked
    document.querySelector('#create .contacts')
        .addEventListener('click', createConversationEvent);

    // when writing in and input element remove error class from form-group
    document.querySelector('body')
        .addEventListener('input', removeFormErrorEvent);

    // when logout button clicked logout
    document.querySelector('#Logout')
        .addEventListener('click', logoutEvent);

    // when conversation bubble is clicked open
    // chat
    document.querySelector('#conversations .container')
        .addEventListener('click', openChatEvent);

    // when close button is clicked close chat
    document.querySelector('.chat')
        .addEventListener('click', closeChatEvent);

    // when clicking in the profile picture of a chat toggle utility
    document.querySelector('.chat')
        .addEventListener('click', openUtilityEvent);

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
        .addEventListener('click', changeSettingsEvent);

    // when inputting any thing to the search form in the top
    // sidebar section call filter the conversations
    document.querySelector('.sidebar .top .form-control')
        .addEventListener('input', filterEvent);

    // when settings button is clicked in sidebar top
    // menu open settings tap
    document.querySelector('.sidebar .top .dropdown-menu button:nth-child(2)')
        .addEventListener('click', OpenSettingsEvent);

    // when logout button is clicked inside the sidebar top
    // menu logout of site
    document.querySelector('.sidebar .top .dropdown-menu button:nth-child(3)')
        .addEventListener('click', logoutEvent);

    // when add contact link is clicked inside
    // the add conversation modal click add contact tab
    document.querySelector('#create .contacts-footer a:nth-child(1)')
        .addEventListener('click', openContactTabEvent);

    // when a file is selected  in the attachment input send it using sockets
    document.querySelector('.chat')
        .addEventListener('change', sendAttachmentEvent);

    // when label button for attachment file input is clicked
    // click the button
    document.querySelector('.chat')
        .addEventListener('click', openAttachmentFileEvent);

    // when a file message is clicked call downloadFileEvent
    document.querySelector('.chat')
        .addEventListener('click', downloadFileEvent);

    // when a contact is clicked create conversation
    document.querySelector('.users')
        .addEventListener('click', createConversationEvent);

    // when a navigation tab link is clicked switch the current tab
    document.querySelector('.nav')
        .addEventListener('click', switchNavigationTabsEvent);

    // when create button is clicked open create modal
    document.querySelector('.nav a[href="#create"]')
        .addEventListener('click', openCreateModalEvent);

    // when the close button is clicked clode modal
    document.querySelector('#create .modal-header .button')
        .addEventListener('click', closeCreateModalEvent);

    document.querySelector('#create .modal-body .nav')
        .addEventListener('click', switchModalTabsEvent);

    // when a setting tab is clicked toggle settings
    document.querySelector('.middle ')
        .addEventListener('click', toggleSettingsEvent);

    // when a chat tab link is clicked switch to that tab
    document.querySelector('.middle ')
        .addEventListener('click', switchChatTabs);

    // when dropdown menu in mobile view is clicked
    // open it
    document.querySelector('.sidebar .top')
        .addEventListener('click', toggleDropdownEvent);

    document.querySelector('.sidebar .top .dropdown-menu .compose')
        .addEventListener('click', openCreateModalEvent);
}


// setup event callbacks for un-authenticated users
export function AddAuthEventListeners() {
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

/* app events */
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
                    }).then(function (element) {
                        return load('chats', {'refresh': true, 'authenticated_contact': data['contact']});
                    }).then(function () {
                        AddEventListeners();
                        // remove preloader
                        wizard.hide(preloader);
                        // open the first conversation
                        openFirstConversation();
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

// when create button is clicked and
// group create is open send create
// conversation event
function addFriendEvent(event) {
    event.preventDefault();


    let form = event.target;
    let formData = new FormData(form);
    let data = {
        'email': formData.get('email'),
    };


    let contact_id = form.dataset['contact'];

    // show preloader
    wizard.show(preloader);

        communicator.send_ajax({'route_name': 'add-friend', 'data': data})
        .then(function (response) {
            if (response['success']) {
                // send notification to user
                // update parts affected
                communicator.send_ajax({'route_name': 'contact-detail', 'args': [contact_id]})
                    .then(function (data) {
                        // close modal
                        wizard.hide(document.querySelector('#create'));

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
                            if (communicator.socket_is_open() && response['contact']['id'] !== data['contact']['id']) {
                                // send a STATUSES EVENT
                                addFriend(response['contact']);
                            }
                        })
                    })
            } else {
                // render errors
                renderFormErrors(form, response['data']['errors']);
                wizard.hide(preloader);
            }
        }, function (response) {
            console.log(`request error status: error: ${response['status']}`);
            // render form error
            renderFormErrors(form, response['data']['errors']);
            wizard.hide(preloader);
        })
}

// when a contact is clicked inside
// the conversation create list
// send conversation create event
function createConversationEvent(event) {
    event.preventDefault();

    let element = event.target.closest('a');

    if (element.classList.contains('contact')) {

        let requestData = {
            "type": "couple",
            "participants": [
                element.dataset['authenticatedContact'],
                element.dataset['contact']
            ],
            "history_mode": true
        };

        wizard.hide(document.querySelector('#create'))

        let conversation = document.querySelector(`#conversations .nav  li a[data-user="${element.dataset['user']}"]`);

        if (!conversation) {
            wizard.show(preloader);

            communicator.send_ajax({'route_name': 'conversation-create', 'data': requestData})
                .then(function (response) {
                    if (response['success']) {
                        load('conversation', response)
                            .then(function (element) {
                                return load('chat', response);
                            })
                            .then(function (element) {
                                AddEventListeners();
                                if (window.screen.width > 991) {
                                    // open first conversation
                                    openFirstConversation();
                                }
                                // hide preloader
                                wizard.hide(preloader);
                            })
                            .then(function () {
                                // check if socket is connected
                                // send event if true
                                if (communicator.socket_is_open()) {
                                    // send a STATUSES EVENT
                                    joinConversation(response['conversation']['id']);
                                    getStatuses();
                                    getNotifications();
                                    notify_participants(response['conversation']['id'])
                                }
                            })
                    }
                }, function (response) {
                    console.log(response)
                })
        }
    }
}

// when create button is clicked and
// group create is open send create
// group event
function createGroupEvent(event) {
    event.preventDefault();

    let form = event.target;

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

            wizard.hide(document.querySelector('#create'));

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
function changeSettingsEvent(event) {
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
function openChatEvent(event) {
    let element = event.target.closest('.filter.direct');
    if (element) {
        let chat = document.querySelector('.chat');
        chat.classList.add('open');
    }
}

// when back button is clicked
// remove open from chat
function closeChatEvent(event) {
    let element = event.target;
    if (element.classList.contains('close-chat') || element.parentElement.classList.contains('close-chat')) {
        let chat = document.querySelector('.chat');
        chat.classList.remove('open');
        let active_tab = document.querySelector('#conversations .nav li a.active');
        if (active_tab){
            active_tab.classList.remove('active');
        }
    }
}

// when profile picture is clicked
// open utility section
function openUtilityEvent(event) {
    let element = event.target.closest('.headline');

    if (element && element.dataset['conversation'] !== undefined) {
        let headline = element.closest('.headline');
        wizard.toggle(document.querySelector(`#conversation_${headline.dataset['conversation']} .utility`));
    }
}

function openAttachmentFileEvent(event) {
    let element = event.target.closest('label');

    if (element) {
        if (element.getAttribute('for') === 'attachments') {
            element.parentElement.querySelector('.attachments').click();
        }
    }
}

// when settings button is clicked inside
// sidebar top menu  open settings
function OpenSettingsEvent() {
    let setting_button = document.querySelector('.navigation .nav li:nth-child(5) a');
    setting_button.click();
}

// when add contact is clicked inside
// the add conversations modal opened the add contact tab
function openContactTabEvent() {
    document.querySelector('#create .modal-body .nav li:nth-child(1) a').click()
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

// when send button is clicked
// send message
function sendMessageEvent(event) {
    if (event.target.classList.contains('send') || event.target.parentElement.classList.contains('send')) {
        let input = event.target.closest('form')['message'];
        let conversation_id = input.dataset['conversation'];
        sendMessage(input, conversation_id)
    }
}

// send file
function sendAttachmentEvent(event) {
    let element = event.target;

    if (element.classList.contains('attachments')) {
        let file = element.files[0];
        if (file.size !== 0) {
            let form_data = new FormData();
            form_data.append('file', file);
            form_data.append('conversation', element.dataset['conversation']);

            communicator.send_ajax({
                'route_name': 'send-attachment',
                'type': false,
                'data': form_data,
            }).then(function (response) {
                return load('message', response)
                    .then(function () {
                        return load('bubble-last-message', response);
                    }).then(function () {
                        if (communicator.socket_is_open()) {
                            communicator.send_json_socket({
                                'command': 'ATTACHMENT_SENT',
                                'message': response,
                            })
                        }
                    }).then(function (element) {
                        eva.replace();
                    })
            })
        }
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

// when a file download icon is clicked download file
function downloadFileEvent(event) {
    let element = event.target.closest('.message');
    if (element) {
        if (element.classList.contains('downloadable')) {
            // download file
            let download_anchor = document.createElement('a');
            download_anchor.setAttribute('href', element.dataset['url']);
            download_anchor.setAttribute('download', element.querySelector('p').innerText);
            download_anchor.style.display = 'none';
            document.body.appendChild(download_anchor);
            download_anchor.click();
            document.body.removeChild(download_anchor);
        }
    }
}

// when navigation tab link is clicked open it
function switchNavigationTabsEvent(event) {
    let tab_link = event.target.closest('.tab-link');
    let active_tab_link = document.querySelector('.navigation .nav .tab-link.active');

    if(tab_link && tab_link.getAttribute('href') !== active_tab_link.getAttribute('href')) {
        switchTabs(tab_link);
    }
}

// when a tab-link is clicked inside the create model switch to it
function switchModalTabsEvent(event) {
    let tab_link = event.target.closest('.tab-link');
    let active_tab_link = document.querySelector('#create .modal-body .tab-link.active');

    if(tab_link && tab_link.getAttribute('href') !== active_tab_link.getAttribute('href')) {
        switchTabs(tab_link);
    }
}


// when add button in nav is clicked open create modal
function openCreateModalEvent(event) {
    let create_modal = document.querySelector('#create');
    wizard.show(create_modal);
}

// when create modal close button is clicked close modal
function closeCreateModalEvent(event) {
    let create_modal = document.querySelector('#create');
    wizard.hide(create_modal);
}

// when a setting dropdown is clicked toggle settings
function toggleSettingsEvent(event) {
    let element = event.target.closest('.headline');

    if (element && element.parentElement.parentElement.getAttribute('id') === 'preferences') {
        toggleSettings(element);
    }
}

// when a chat is tab is clicked switch to it
function switchChatTabs(event) {
    let element = event.target.closest('.tab-link');

    if (element && !document.querySelector(element.getAttribute('href')).classList.contains('active')){
            switchTabs(element);
    }
}

// when the dropdown button is clicked open menu
function toggleDropdownEvent(event) {
    let element = event.target.closest('button');

    if(element && element.nextElementSibling.classList.contains('dropdown-menu')){
        let dropdown = element.nextElementSibling;

        if(!dropdown.style.display || dropdown.style.display === 'none') {
            dropdown.style.display = 'block'
        }

        else if(dropdown.style.display === 'block'){
            dropdown.style.display = 'none';
        }
    }
}


/* Websocket receive callback */
// setup callbacks for websockets
export function receive(data) {
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
        eva.replace();
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
    load('notification', {'notification': data['notification'], 'refresh': true})
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

export function filterEvent(event) {
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
