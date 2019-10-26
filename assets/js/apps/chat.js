/* handles sending and receiving messaging */

let chatSocket;

/* connect a chat socket */
function connectChatSocket() {
    let promise = $.Deferred();

    // Correctly decide between ws:// and wss://
    let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
    let ws_path = ws_scheme + '://' + window.location.host + "/ws/chat/";

    // noinspection ES6ModulesDependencies
    chatSocket = new ReconnectingWebSocket(ws_path);

    chatSocket.onopen = (e) => promise.resolve("chat socket connected");
    chatSocket.onerror = (e) => promise.reject("chat socket failed to connect");
    chatSocket.onclose = (e) => console.log('chat socket disconnected');
    return promise;
}

/* close chat socket and send 
disconnect event to server */
function closeChatSocket() {
    chatSocket.close()
}


/* a small utility function that decide wither close app not*/
function handleChatCommands(command) {
    if (command === "CLOSE") {
        closeChatSocket();
    } else {
        joinConversations();
    }
}

/* initialize the chat app */
export function chat(new_socket = false, command) {
    if (new_socket) {
        $.when(connectChatSocket()).then(function (status) {
            console.log(status);
            handleChatCommands(command);
        }, function (error) {
            console.error(error);
        });
    } else {
        if (chatSocket) {
            handleChatCommands(command);
        }
    }
}

/* join all the user conversations */
function joinConversations() {
    if (chatSocket) {
        let conversations = $('#conversations .discussion li');
        for (let conversation of conversations) {
            let conversation_name = $(conversation).find('a').attr('data-name');
            joinConversation(conversation_name);
        }

        chatSocket.onmessage = function (event) {
            let content = event['data'];
            receive(content);
        };
    } else {
        console.error('socket is not created yet');
    }
}


/* send messages to the channel server */
export function send(data) {
    switch (data['command']) {
        case "JOIN":
            break;
        case "LEAVE":
            break;
        case "MESSAGE":
            sendMessage(data['message'], data['conversation_name']);
            break;
        default:
            console.error('command not found');
            break;
    }
}

/* receive, handle errors and render events messages */
function receive(content) {
    let data = JSON.parse(content);

    if (data['success']) {
        switch (data['command']) {
            case "JOIN":
                console.info(`${data['conversation_name']} joined`); /* for debug purposes */
                break;
            case "LEAVE":
                console.info(`${data['conversation_name']} left`); /* for debug purposes */
                break;
            case "MESSAGE":
                console.log(data);
                receiveMessage(data);
                break;
            default:
                console.error('command not found'); /* for debug purposes */
                break;
        }
    } else if (!data['success']) {
        console.error(data['error']); /* for debug purposes */
    }
}


function joinConversation(conversation_name) {
    /* join a single conversation */
    chatSocket.send(JSON.stringify({
        "command": "JOIN",
        "conversation_name": conversation_name,
    }));
}

/* send leave conversation event to channel server */
function leaveConversation(conversation_name) {
    chatSocket.send(JSON.stringify({
        "command": "LEAVE",
        "conversation_name": conversation_name,
    }));
}

/* send a text message */
function sendMessage(message, conversation_name) {
    chatSocket.send(JSON.stringify({
        "command": "MESSAGE",
        "message": message,
        "conversation_name": conversation_name,
    }));
}


/* render message in html */
function receiveMessage(data) {
    let conversation_name = data['conversation_name'];
    let conversation = $(`#conversations  a[data-name="${conversation_name}"]`);
    let message_container = $(`#${data['conversation_name']} .middle ul`);
    let odd_user = conversation.attr('data-user');
    let self_user = data['email'];
    let message = data['message'];
    let contact_pic;
    let time = data['time_sent'];
    let message_type = self_user === odd_user ? "odd" : "self";

    if (message_type === "self") {
        contact_pic = data['contact_pic']
    } else {
        contact_pic = conversation.find('img').attr('src');
    }

    let html_message = $(`<li class="${message_type}">
                        <img src="${contact_pic}" alt="avatar">
                        <div class="content">
                            <div class="message">
                                <div class="bubble">
                                    <p>${message}</p>
                                </div>
                            </div>
                            <span>${time}</span>
                        </div>
                    </li>`);

    conversation.find('p').html(message.slice(0, 35) + "...");
    conversation.find('.headline span').html("Today");

    message_container.append(html_message);

    html_message.ready(function (e) {
        let conversation = document.querySelector(`#${conversation_name} .middle`);
        let height = conversation.scrollHeight;
        conversation.scrollTop += height + 500;
    });
}