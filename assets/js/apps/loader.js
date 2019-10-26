/* an app that manges loading data */
/* via a websocket connection */
import {switchHome} from "../utility/screen_switching.js";
import {hide_loader} from "../utility/loader.js";

/* global socket used in functions below  */
let loaderSocket;

function connectLoaderSocket() {
    let promise = $.Deferred();
    let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
    let ws_path = ws_scheme + '://' + window.location.host + "/ws/load/";

    //  create loader socket connection
    // noinspection ES6ModulesDependencies
    loaderSocket = new ReconnectingWebSocket(ws_path);

    loaderSocket.onopen = (e) => promise.resolve("loader socket connected");
    loaderSocket.onerror = (e) => promise.reject("loader socket failed to connect");
    loaderSocket.onclose = (e) => console.log('loader socket disconnected');

    return promise;
}

/* close the loader socket */
function closeLoaderSocket() {
    let conversation_container = $('#conversations .nav');
    conversation_container.html('');

    let friends_container = $("#friends .users");
    friends_container.html('');

    let notifications_container = $('#notifications .notifications');
    notifications_container.html('');

    let chat_container = $('.chat .tab-content');
    chat_container.html('');

    loaderSocket.close();
}


function handleLoaderCommands(command, name) {
    if (command === "CLOSE") {
        closeLoaderSocket();
    } else {
        /* setup socket events */
        loaderSocket.onmessage = (event) => {
            loadData(event, command, loaderSocket)
        };

        if (command === "CHAT") {
            loaderSocket.send(JSON.stringify({
                'command': command,
                'name': name,
            }));
        } else {
            loaderSocket.send(JSON.stringify({
                'command': command
            }));
        }
    }
}

/* site loader used to load and update parts of the site */
export function load(command = "ALL", name = null, new_socket = false) {
    if (new_socket) {
        $.when(connectLoaderSocket()).then(function (status) {
            console.log(status);
            handleLoaderCommands(command, name);
        }, function (error) {
            console.error(error);
        });
    } else {
        if (loaderSocket) {
            handleLoaderCommands(command, name);
        }
    }
}


/* when receive load data to site*/
function loadData(event, command, socket) {
    let data = JSON.parse(event['data']);

    /* for debug purposes */
    console.log(data);

    if (data['success']) {
        switch (command) {
            case "ALL":
                loadAll(data, command);
                break;
            case "NOTIFICATIONS":
                if (data['notifications'])
                    loadNotifications(data['notifications'], command);
                break;
            case "CONTACT":
                if (data['contact'])
                    loadPersonalContact(data['contact'], command);
                break;
            case "SETTINGS":
                if (data['settings'] && data['contact'])
                    loadSettings(data['settings'], data['contact'], command);
                break;
            case "CONVERSATIONS":
                if (data['conversations'] && data['contact'])
                    loadConversations(data['conversations'], data['contact'], command);
                break;
            case "FRIENDS":
                if (data['friends'])
                    loadFriends(data['friends'], command);
                break;
            case "CHAT":
                if (data['conversation'] && data['contact'])
                    console.log(data['conversation'], data['contact']);
                break;
            default:
                console.log("no such command"); /* for debug purposes */
                break;
        }
        /*trigger an event after loading all data*/
        $("body").trigger('DataLoaded');

    } else {
        console.log(data['error']); /* for debug purposes */
    }

    switchHome();
    hide_loader();

}

function loadAll(data, command) {
    if (data['contact'])
        loadPersonalContact(data['contact'], command);

    if (data['notifications'])
        loadNotifications(data['notifications'], command);

    if (data['settings'] && data['contact'])
        loadSettings(data['settings'], data['contact'], command);

    if (data['conversations'] && data['contact'])
        loadConversations(data['conversations'], data['contact'], command);

    if (data['friends'])
        loadFriends(data['friends'], command);
}

/* helper functions*/
/* takes care of load functionality */

/* request and render personal contact img */
function loadPersonalContact(data, command) {
    let contact_picture = $('.navigation .nav .profile-picture');
    contact_picture.attr(`src`, `${data['contact_pic']}`);
}

/* request and render conversations */
function loadConversations(conversations, contact, command) {

    let counter = 0;

    let container = $('#conversations .nav');

    for (let conversation of conversations) {
        /* incr counter */
        counter++;
        for (let friend_contact of conversation['contacts']) {

            /* dont render the conversation twice */
            /* only render the conversation with your friend info */
            if (friend_contact['user'] !== contact['user']) {

                let full_name = friend_contact['first_name'] + " " + friend_contact['last_name'];
                if (full_name.length > 15) {
                    full_name = friend_contact['first_name'][0].toUpperCase() +
                        friend_contact['first_name'].slice(1, friend_contact['first_name'].length) +
                        " " +
                        friend_contact['last_name'].slice(0, 1).toUpperCase()
                }

                if (conversation['last_message_content']) {
                    // noinspection ES6ConvertVarToLetConst
                    var last_message = conversation['last_message_content'].slice(0, 35) + "..."
                } else {
                    last_message = "";
                    conversation['last_message_date'] = "";
                }

                /* create conversation html element */
                let html_conversation = $(`<li>
                                         <a href="#${conversation['name']}" class="filter direct" data-name="${conversation['name']}" data-user="${friend_contact['user']}" data-toggle="tab" data-chat="open" role="tab"
                                            aria-controls="${conversation['name']}" aria-selected="true">
                                            <div class="status online">
                                               <div class="circle-status">
                                                  <img src="${friend_contact['contact_pic']}" alt="avatar">
                                               </div>
                                            </div>
                                            <div class="content">
                                               <div class="headline">
                                                  <h5>${full_name}</h5>
                                                  <span>${conversation['last_message_date']}</span>
                                               </div>
                                               <p>${last_message}</p>
                                            </div>
                                         </a>
                                      </li>`);


                if (counter === 1) {
                    let conversation_link = html_conversation.find('a');
                    html_conversation.find('a').addClass('joined');
                    conversation_link.addClass('active');
                }

                /* set style for animating conversations */
                if (command !== "ALL") {
                    html_conversation.css({
                        "opacity": 0,
                        "margin-top": 30,
                    });
                }

                /* render conversations */
                container.append(html_conversation);

                /* render chat*/
                loadChat(conversation, contact, friend_contact, counter);

                /* animate conversations */
                if (command !== "ALL") {
                    html_conversation.animate({
                        "opacity": 1,
                        "margin-top": 10,
                    }, 200)
                }
            }
        }
    }
}

/* request and render friends */
function loadFriends(data, command) {
    let container = $("#friends .users");
    for (let friend of data) {
        let html_friends = $(`<li>
                              <a href="#">
                                 <div class="status online">
                                    <img src="${friend.contact_pic}" alt="avatar">
                                 </div>
                                 <div class="content">
                                       <h5>${friend.first_name} ${friend.last_name}</h5>
                                       <span>${friend.location}</span>
                                 </div>
                                 <div class="icon">
                                    <i class="flaticon-user"></i>
                                 </div>
                              </a>
                           </li>`);

        /* set style for animating friends */
        if (command !== "ALL") {
            html_friends.css({
                "opacity": 0,
                "margin-top": 30,
            });
        }

        /* append friends */
        container.append(html_friends);

        /* animate notifications */
        if (command !== "ALL") {
            html_friends.animate({
                "opacity": 1,
                "margin-top": 10,
            }, 200)
        }
    }
}

/* request and render notifications */
function loadNotifications(data, command) {
    let container = $('#notifications .notifications');
    for (let notification of data) {
        /* create notification html element */
        let html_notification = $(`<li><div class="round">
                                <i></i></div>
                                <p><strong>${notification['type']} </strong>
                                ${notification['content']}</p>
                                </li>`);
        let notification_icon = html_notification.find('.round i');

        /* choose an icon that corresponds
        to the notification type */
        if (notification.type === "accounts") {
            notification_icon.addClass('flaticon-apps')
        } else if (notification.type === "conversation") {
            notification_icon.addClass('flaticon-new-file')
        } else if (notification.type === "default") {
            notification_icon.addClass('flaticon-check-square')
        }

        /* set style for animating notifications */
        if (command !== "ALL") {
            html_notification.css({
                "opacity": 0,
                "margin-top": 30,
            });
        }

        /* append notification */
        container.append(html_notification);

        /* animate notifications */
        if (command !== "ALL") {
            html_notification.animate({
                "opacity": 1,
                "margin-top": 10,
            }, 200)
        }
    }
}

/* request and render settings */
function loadSettings(data, contact, command) {
    let privacy_mode = $('#privacy-settings .options li:nth-child(1) input');
    let history = $('#privacy-settings .options li:nth-child(2) input');

    let notifications = $('#notifications-settings .options li:nth-child(1) input');
    let night_mode = $('#appearance-settings .options li:nth-child(1) input');

    if (data['history']) {
        history.prop("checked", true)
    } else {
        history.prop("checked", false)
    }

    if (data['privacy_mode']) {
        privacy_mode.prop("checked", true)
    } else {
        privacy_mode.prop("checked", false)
    }

    if (data['notifications']) {
        notifications.prop("checked", true)
    } else {
        notifications.prop("checked", false)
    }

    if (data['theme'] === 'dark') {
        night_mode.prop("checked", true)
    } else {
        night_mode.prop("checked", false)
    }
}

/* request and render chat*/
function loadChat(conversation, contact, friend_contact, counter) {
    let chat_container = $('.chat .tab-content');

    let html_chat = $(`<div class="tab-pane fade show" id="${conversation['name']}" role="tabpanel">
    <div class="item">
        <div class="content">
            <div class="container">
                <div class="top">
                    <div class="headline">
                        <img src="${friend_contact['contact_pic']}" alt="avatar">
                        <div>
                            <h5>${friend_contact['first_name']} ${friend_contact['last_name']}</h5>
                            <span>Active Now</span>
                        </div>
                    </div>
                    <ul>
                        <li>
                            <button type="button" data-conversation="${conversation['name']}" data-utility="open">
                                <i class="flaticon-connections"></i>
                            </button>
                        </li>
                        <li>
                            <button type="button" class="button round" data-chat="open">
                                <i class="flaticon-left-arrow"></i>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" class="btn" data-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false"><i class="eva-hover">
                                <i data-eva-animation="pulse" data-hover="hover" data-eva="more-vertical"></i></i>
                            </button>
                            <div class="dropdown-menu" x-placement="bottom-start"
                                 style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(210px, 65px, 0px);">
                                <button type="button" class="dropdown-item"><i data-eva="video"></i>Video call</button>
                                <button type="button" class="dropdown-item"><i data-eva="phone"></i>Voice call</button>
                                <button type="button" class="dropdown-item" data-toggle="modal" data-target="#compose">
                                    <i data-eva="person"></i>Add people
                                </button>
                                <button type="button" class="dropdown-item" data-utility="open"><i data-eva="info"></i>Information
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="middle scroll">
                <div class="container">
                    <ul></ul>
                </div>
            </div>
            <div class="container">
                <div class="bottom">
                    <form onsubmit="return false">
                        <textarea class="form-control" placeholder="Type a message..." rows="1"></textarea>
                        <button type="submit" class="send btn prepend" data-conversation="${conversation['name']}">
                            <i class="flaticon-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <div class="utility">
            <div class="container">
                <button type="button" class="close" data-conversation="${conversation['name']}" data-utility="open"><i
                        data-eva="close"></i></button>
                <div class="profile">
                    <p>Profile Info</p>
                    <img src="${friend_contact['contact_pic']}" alt="">
                    <h4>${friend_contact['first_name']} ${friend_contact['last_name']}</h4>
                    <span>Active Now</span>
                </div>
                <div class="attachment">
                    <div class="headline">
                        <span>Attachment</span>
                        <label class="button" for="upload">
                            <i class="flaticon-folders"></i>
                        </label>
                        <input type="file" id="upload">
                    </div>
                    <div class="media">
                        <img src="/static/images/pictures/stock_1.jpg" alt="food">
                        <img src="/static/images/pictures/stock_2.jpg" alt="food">
                        <img src="/static/images/pictures/stock_3.jpg" alt="food">
                        <img src="/static/images/pictures/stock_4.jpg" alt="food">
                        <div class="file-media">
                            <i class="flaticon-high-volume"></i>
                        </div>
                        <div class="file-media">
                            <i class="flaticon-note"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`);
    if (counter === 1) {
        html_chat.addClass('active');
    }
    /* render html chat */
    addMessages(html_chat, conversation, friend_contact, contact);
    chat_container.append(html_chat);
}

/* render messages in each html_chat */
function addMessages(html_chat, conversation, friend_contact, contact) {

    let messages = conversation['message_set'];
    let message_container = html_chat.find('.middle ul');

    for (let message of messages) {
        let message_type = message['sender'] === friend_contact['user'] ? "odd" : "self";
        let html_message = $(`<li class="${message_type}">
                                <img src="" alt="avatar">
                                <div class="content">
                                    <div class="message">
                                        <div class="bubble">
                                            <p>${message['content']}</p>
                                        </div>
                                    </div>
                                    <span>${message['time_sent']}</span>
                                </div>
                            </li>`);

        let html_message_image = html_message.find('img');
        if (message_type === "odd") {
            html_message_image.attr('src', friend_contact['contact_pic']);
        } else {
            html_message_image.attr('src', contact['contact_pic']);
        }
        message_container.append(html_message);
    }
}