import {AbstractComponentFactory} from './renderer.js'

export class ComponentFactory extends AbstractComponentFactory {
    static getComponent(component_name) {
        // returns a component model from the ComponentModels object below
        let componentModel = ComponentsModels[component_name];

        if (!componentModel) {
            throw new Error('No component model with the name ' + component_name)
        } else {
            return componentModel
        }
    }

    static template(template_url, data) {
        /*
         uses ejs template engine to template a template string
         returns a templated js string
         note: it doesn't return html
        */

        // first get the template using dynamic imports
        return ComponentFactory.load(template_url)
            .then((template) => {
                try {
                    // template string and return the templated javascript string
                    return ejs.render(template, data);
                } catch (e) {
                    throw new Error('Templating Error' + e.message)
                }
            }, (e) => {
                throw new Error('Template not found' + e.message)
            })
    }

    static async load(template_url) {
        /*
        * imports the string to be templated using template_url and dynamic imports.
        * then returns a resolved promise with the template string.
        * */
        let template_module = await import(template_url);
        return template_module.template;
    }

    static strToHTML(str_element) {
        // converts strings to html using DOMParser object
        // if no browser support for DOMParser simply
        // renders html element inside div

        // check for browser support
        let support = (function () {
            // browser doesn't support dom parser return false
            if (!window.DOMParser) return false;

            // else create a new dummy parser
            let parser = new DOMParser();
            try {
                // try to parse the dummy string
                parser.parseFromString('x', 'text/html');
            } catch (err) {
                // if parse failed return false
                return false;
            }
            // if parse succeeded return true
            return true;
        })();

        // if dom parser is supported
        if (support) {
            // create a new dom parser
            let parser = new DOMParser();
            // parse text to html
            let doc = parser.parseFromString(str_element, 'text/html');
            // return the parsed element
            return doc.body.children[0];
        } else {
            // Otherwise, fallback to old-school method
            let dom = document.createElement('div');
            dom.innerHTML = str_element;
            return dom;
        }
    }

    create(kwargs = {'component_name': null, 'data': null}) {
        /*
            templates components and renders it to html
        */
        let component_name = kwargs['component_name'];
        let data = kwargs['data'];

        if (!component_name) {
            throw new Error("Expected args not provided!");
        } else {
            // get component model using the component name
            let componentModel = ComponentFactory.getComponent(component_name);
            // render the template inside the component
            return ComponentFactory.template(componentModel['template_url'], data)
                .then((htmlString) => {
                    // parse html string to an html element
                    let element = ComponentFactory.strToHTML(htmlString);
                    // return new component
                    return {
                        'container': componentModel['container'],
                        'selector': componentModel['selector'],
                        'element': element,
                        'render_mode': componentModel['render_mode'],
                    }
                })
        }
    }
}

let ComponentsModels = {
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
