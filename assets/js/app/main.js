/*
* main.js
* controls order of execution
* */
import {load} from './load.js'

import {communicator, wizard} from "./init.js";

import {
    changeTheme,
    openFirstConversation,
    scrollChat,
} from "./interface.js";

import {
    AddAuthEventListeners,
    AddEventListeners,
    receive
} from "./events.js"

import {
    joinConversations,
    getStatuses,
} from "./chat.js";

let preloader = document.querySelector('.loader');
let b_preloader = document.querySelector('.b-preloader');

let siteLoaded = false;


// this is the main function it calls it's self
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
                    load('chat-app', {'authenticated_contact': data['contact']}, communicator)
                        .then(function () {
                            // attach all events
                            AddEventListeners();
                            // change theme cookie based on settings
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
            // change theme based on cookies
            let theme;

            if (Cookies.get('theme')) {
                // if the theme exist set that theme
                theme = Cookies.get('theme') === 'dark';
            } else {
                // otherwise enable dark mode
                theme = true;
            }
            changeTheme(theme);
            // show login and register logic
            wizard.show(document.querySelector('#Login'));
            wizard.hide(preloader);
            siteLoaded = true;
        }
    })
})();

function startUp() {
    wizard.fadeIn(document.querySelector('.b-preloader img'))

    wizard.progressFill(document.querySelector('.b-preloader .progress .progress-bar'), 1500, () => {
        let id = setInterval(function () {
            if (siteLoaded) {
                wizard.hide(b_preloader);
                clearInterval(id);
            }
        }, 1500)
    });
}
