/* chat.js
* sending messages and joining conversations
*  */
import {communicator} from "./init.js";

// join all conversations
export function joinConversations() {
    let conversations = document.querySelectorAll('#conversations .discussion li');

    for (let conversation of conversations) {
        let conversation_id = conversation.querySelector('a').dataset['id'];
        communicator.send_json_socket({'command': 'JOIN', 'id': conversation_id});
    }
}

// join a conversation
export function joinConversation(conversation_id) {
    communicator.send_json_socket({'command': 'JOIN', 'id': conversation_id});
}

// send a text message
export function sendMessage(input, conversation_id) {
    if (input.value !== '' && input.value.length >= 1 && input.value.trim().length !== 0) {

        let contact_pic = document.querySelector('.profile-container img').getAttribute('src');


        communicator.send_json_socket({
            'command': 'MESSAGE',
            'id': conversation_id,
            'message': input.value,
            'contact_pic': contact_pic,
        });
        input.value = '';
    } else {
        input.value = '';
    }
}

// get the status of all friends
export function getStatuses() {
    communicator.send_json_socket({'command': 'STATUSES'});
}

// get notifications for the authenticated user
export function getNotifications() {
    communicator.send_json_socket({'command': 'NOTIFICATION'})
}

// called when
export function notify_participants(conversation_id) {
    communicator.send_json_socket({
        'command': 'CONVERSATION',
        'id': conversation_id,
    })
}

// added a friend to you cached friend list
export function addFriend(contact) {
    communicator.send_json_socket({'command': 'FRIEND_ADDED', 'contact': contact})
}
