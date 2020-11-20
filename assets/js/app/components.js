/*
* components used in interface
* a components is an object containing:
* template_url: url to the javascript module where the html template is defined
* render-mode: used to define the way to render the html element supported render modes (append, replace ,
* replaceOrAppend, replaceOrPrepend)
* container: if render mode is append or prepend a container is needed
* selector: if render mode is replace a selector is needed
*
* */
export let components = {
    'contact-picture': {
        container: "circle-status",
        selector: ".navigation .nav .profile-picture",
        render_mode: "replaceOrAppend",
        template_url: "../components/contact-picture.js",
    },

    'conversations-list': {
        container: '.sidebar .middle #conversations .container',
        selector: '.sidebar .middle .nav',
        render_mode: 'replaceOrAppend',
        template_url: "../components/conversations-list.js",
    },

    'conversation-bubble': {
        render_mode: 'append',
        template_url: "../components/conversation-bubble.js",
    },

    'bubble-last-message': {
        render_mode: 'replaceOrAppend',
        template_url: "../components/bubble-last-message.js",
    },

    'first-conversation-bubble': {
        container: '.sidebar .middle #conversations .container',
        selector: '.sidebar .middle .empty-section',
        render_mode: 'replaceOrAppend',
        template_url: "../components/first-conversation-bubble.js",
    },

    'friends-list': {
        container: '.sidebar .middle #friends .container',
        selector: '.sidebar .middle #friends .users',
        render_mode: 'replaceOrAppend',
        template_url: "../components/friends-list.js",
    },

    'notifications-list': {
        container: '.sidebar .middle #notifications .container',
        selector: '.sidebar .middle #notifications .notifications',
        render_mode: 'replaceOrPrepend',
        template_url: "../components/notifications-list.js",
    },

    'notification-bubble': {
        container: '.sidebar .middle #notifications .notifications',
        render_mode: 'prepend',
        template_url: "../components/notification-bubble.js",
    },

    'first-notification-bubble': {
        container: '.sidebar .middle #notifications .container',
        selector: '.sidebar .middle #notifications .empty-section',
        render_mode: 'replaceOrPrepend',
        template_url: "../components/first-notification-bubble.js",
    },

    'chats-list': {
        container: '.chat',
        selector: '.chat .tab-content',
        render_mode: 'replaceOrAppend',
        template_url: "../components/chats-list.js",
    },

    'first-chat': {
        container: '.chat',
        selector: '.chat .tab-content',
        render_mode: 'replaceOrAppend',
        template_url: "../components/first-chat.js",
    },

    'chat': {
        render_mode: 'append',
        template_url: "../components/chat.js",
    },

    'message': {
        render_mode: 'append',
        template_url: "../components/message.js"
    },

    'contact-update-form': {
        container: '#account .inside',
        selector: '#account form.account',
        render_mode: "replaceOrAppend",
        template_url: "../components/contact-update-form.js",
    },

    'conversation-create-form': {
        container: 'body .layout',
        selector: '#create',
        render_mode: 'replaceOrAppend',
        template_url: "../components/conversation-create-form.js",
    },

    'privacy-switch': {
        container: "#privacy-settings #privacy .options",
        selector: "#privacy-settings #privacy .options .privacy-mode",
        render_mode: "replaceOrAppend",
        template_url: "../components/privacy-switch.js",
    },

    'history-switch': {
        container: "#privacy-settings #privacy .options",
        selector: "#privacy-settings #privacy .options .history-mode",
        render_mode: "replaceOrAppend",
        template_url: "../components/history-switch.js",
    },

    'theme-switch': {
        container: "#appearance-settings #appearance",
        selector: "#appearance-settings #appearance .night-mode",
        render_mode: "replaceOrAppend",
        template_url: "../components/theme-switch.js",
    },

    'notifications-switch': {
        container: '#notifications-settings #alerts',
        selector: '#notifications-settings #alerts .notifications-mode',
        render_mode: 'replaceOrAppend',
        template_url: "../components/notifications-switch.js",
    },

    'save-notifications-switch': {
        container: '#notifications-settings #alerts',
        selector: '#notifications-settings #alerts .save-notifications-mode',
        render_mode: 'replaceOrAppend',
        template_url: "../components/save-notifications-switch.js",
    },
};