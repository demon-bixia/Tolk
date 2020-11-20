/*
* interface.js
* the behavior of the user interface
* */

// switch between settings dropdown
export function toggleSettings(selected_dropdown_headline) {
    let same = false;
    // get the selected dropdown
    let selected_dropdown = selected_dropdown_headline.nextElementSibling;
    // find the opened dropdown
    let dropdown_containers_list = selected_dropdown_headline.parentElement.parentElement;
    // loop through dropdown containers and find the opened dropdown
    for (let dropdown_container of dropdown_containers_list.children) {
        let dropdown = dropdown_container.querySelector('.content');
        // if dropdown is opened
        if (!dropdown.classList.contains('collapse')) {
            if (dropdown.getAttribute('id') === selected_dropdown.closest('.content').getAttribute('id')) {
                same = true;
                selected_dropdown.classList.add('collapse')

                // switch arrows
                selected_dropdown_headline.querySelector('.eva-arrow-ios-forward').style.display = 'block';
                selected_dropdown_headline.querySelector('.eva-arrow-ios-downward').style.display = 'none';
            } else {
                dropdown.classList.add('collapse')
                // switch arrows
                dropdown.previousElementSibling.querySelector('.eva-arrow-ios-forward').style.display = 'block';
                dropdown.previousElementSibling.querySelector('.eva-arrow-ios-downward').style.display = 'none';
            }
        }
    }

    if (!same) {
        selected_dropdown.classList.remove('collapse');

        // switch arrows
        selected_dropdown_headline.querySelector('.eva-arrow-ios-forward').style.display = 'none';
        selected_dropdown_headline.querySelector('.eva-arrow-ios-downward').style.display = 'block';
    }
}


// switch between two tabs
export function switchTabs(selected_tab_link) {
    // get the select tab_link container: the container for tab-links containers
    let tab_links_containers = selected_tab_link.parentElement.parentElement
    // loop through tab link containers to find the wanted
    for (let tab_link_container of tab_links_containers.children) {
        // get the tab_link element inside container
        let tab_link = tab_link_container.querySelector('.tab-link');
        // if tab_link is active
        if (tab_link && tab_link.classList.contains('active')) {
            // if it's the same selected tab link
            if (tab_link.getAttribute('href') === selected_tab_link.getAttribute('href')) {
                break;
            } else {
                // close the opened tab link
                tab_link.classList.toggle('active');
                // reset search results in old tab link
                resetSearch(tab_link)
            }
        }
    }

    // open the selected tab link
    selected_tab_link.classList.toggle('active');

    // get the tab using the clicked tab link
    let selected_tab = document.querySelector(selected_tab_link.getAttribute('href'));
    // get the selected tab parent element: the container for the rest of the tabs
    let tabParent = selected_tab.parentElement

    // look for the currently opened tab
    for (let tab of tabParent.children) {
        if (tab.classList.contains('active')) {
            // if it's the same tab break loop
            if (tab.getAttribute('id') === selected_tab.getAttribute('id')) {
                break;
            } else {
                // if not close it
                tab.classList.toggle('active');
                tab.classList.toggle('show');
            }
        }
    }

    // open the selected tab
    selected_tab.classList.toggle('active')
    selected_tab.classList.toggle('show')

}

export function conversationReset() {
    let conversations = document.querySelectorAll('#conversations .nav li');
    if (conversations) {
        for (let conversation of conversations) {
            conversation.style.display = 'list-item';
        }
    }
}

export function friendsReset() {
    let friends = document.querySelectorAll('#friends .users li');
    if (friends) {
        for (let friend of friends) {
            friend.style.display = 'list-item';
        }
    }
}

export function notificationsReset() {
    let notifications = document.querySelectorAll('#notifications .notifications li');
    if (notifications) {
        for (let notification of notifications) {
            notification.style.display = 'flex';
        }
    }
}

export function settingsReset() {
    let settings_tabs = document.querySelectorAll('#settings #preferences li');
    for (let settings_tab of settings_tabs) {
        let settings_contents = settings_tab.querySelectorAll('.content.collapse');
        for (let setting_content of settings_contents) {
            setting_content.classList.remove('show');
        }
    }
}

export function filterConversations(value) {
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

export function filterFriends(value) {
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

export function filterNotification(value) {
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

export function filterSettings(value) {
    let settings_tabs = document.querySelectorAll('#settings #preferences li');
    let regx = new RegExp(`${value}`, 'ig');
    let opened;

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
                                setting_content.classList.add('show');
                                opened = setting_content;
                            } else {
                                name.classList.remove('highlight');
                                if (opened) {
                                    if (setting_content.getAttribute('id') !== opened.getAttribute('id')) {
                                        setting_content.classList.remove('show');
                                    }
                                } else {
                                    setting_content.classList.remove('show');
                                }
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

export function resetSearch(opened_nav) {
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

export function renderFormErrors(form, form_errors) {
    for (let field_name of Object.keys(form_errors)) {
        if (field_name === 'non_field_errors') {
            // append errors if form has a non field
            // errors container
            let alert = document.createElement('div');
            alert.classList.add('alert');
            alert.classList.add('alert-danger');
            alert.classList.add('alert-dismissible');
            alert.innerHTML = `<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>`;

            for (let error_msg of form_errors[`${field_name}`]) {
                let strong = document.createElement('p');
                strong.innerHTML = error_msg;
                alert.append(strong);
            }

            form.prepend(alert);
        } else {
            let field = form.querySelector(`input[name="${field_name}"]`); // find filed using name
            let parent;

            if (field.classList.contains('custom-file-input')) {
                parent = field.parentElement.parentElement;
            } else {
                parent = field.parentElement; // find the form-group element
            }

            let errors = form_errors[`${field_name}`];
            let error_container = parent.querySelector('.error_container');

            /* change style of form-group  */
            parent.classList.add('error');

            /* empty error container */
            error_container.innerHTML = '';

            /* show error */
            for (let error_msg of errors) {
                /* show errors */
                let small = document.createElement('small');
                small.classList.add('error-message');
                small.innerHTML += error_msg;
                error_container.append(small);
            }
        }
    }
}

export function removeFormErrorEvent(event) {
    if (event.target.classList.contains('form-control')) {
        let parent = event.target.parentElement;

        if (parent.classList.contains('error')) {
            // remove red outline
            parent.classList.remove('error');

            // remove error messages
            let error_container = parent.querySelector('.error_container');
            error_container.innerHTML = '';
        }

    }
}

export function emptyForm(form) {
    for (let element of form.elements) {
        if (element.type === 'checkbox') {
            element.checked = false
        } else {
            element.value = '';
        }
    }
}

export function openFirstConversation() {
    // activate a conversation
    let conversation = document.querySelector('#conversations .discussion li:nth-child(1) a');

    if (conversation) {
        conversation.click();
    }

    return conversation
}

export function scrollChat(conversation) {
    if (conversation) {
        // find chat for given conversation
        let chat_id = conversation.getAttribute('href');
        let chat_list = document.querySelector(`${chat_id} .scroll`);
        let scroll_height = chat_list.scrollHeight;
        chat_list.scrollBy(0, scroll_height);
    }
}

export function changeTheme(dark) {
    // change values of css variables
    let theme_colors;
    let root = document.documentElement;

    if (dark) {
        theme_colors = dark_theme_colors
    } else {
        theme_colors = light_theme_colors
    }

    for (let color_name of Object.keys(theme_colors)) {
        root.style.setProperty(color_name, theme_colors[color_name]);
    }
}

let light_theme_colors = {
    '--plain-font-color': '#76839f',
    '--icon-color': '#3c4063',
    '--mute-font-color': '#76839f',
    '--link-color': '#fff',
    '--active-radio-color': '#00f890',
    '--active-link-color': '#8725c7',
    '--utils-background-color': '#fff',
    '--hr-border-color': '#fbfbfb',

    '--navigation-background': '#e1e2e4',
    '--navigation-circle-box-shadow': 'transparent',
    '--navigation-active-icon': '#2339ff',

    '--sidebar-background-color': '#ffffff',
    '--sidebar-discussion-chat-color': '#fff',
    '--sidebar-active-chat-gradient-color-1': '#e1e2e4',
    '--sidebar-active-chat-gradient-color-2': '#e1e2e4',
    '--sidebar-friend-color': '#e1e2e4',
    '--sidebar-friend-icon-color': '#2339ff',
    '--sidebar-notifications-color': '#e1e2e4',
    '--sidebar-notifications-icon-color': '#2339ff',

    '--sidebar-mobile-menu-icon-color': '#76839f',
    '--sidebar-mobile-menu-background': '#e1e2e4',
    '--sidebar-mobile-menu-font-color': '#76839f',
    '--sidebar-mobile-menu-icons-color': '#76839f',

    '--search-form-input-background-color': '#fff',
    '--search-form-input-font-color': '#76839f',
    '--search-form-input-hover-color': '#efebeb',
    '--search-form-input-border-color': '#f5f5f5',


    '--form-input-background-color': '#e1e2e4',
    '--form-input-font-color': '#76839f',
    '--form-input-border': '#efebeb',
    '--form-input-hover': '#f5f5f5',
    '--form-input-focus-color': '#2339ff',
    '--checked-input-color': '#2339ff',
    '--submit-button-color': '#2339ff',

    '--chat-top-background': '#fff',
    '--chat-background-color': '#fff',
    '--chat-bottom-background': '#fff',
    '--chat-border-color': '#f9f9f9',
    '--chat-top-icon-color': '#7b8ebc',
    '--chat-odd-message-gradient-color-1': '#e1e2e4',
    '--chat-odd-message-gradient-color-2': '#e1e2e4',
    '--chat-self-message-gradient-color-1': '#e1e2e4',
    '--chat-self-message-gradient-color-2': '#e1e2e4',
    '--chat-message-font-color': '#252525',

    '--compose-header-background': '#e1e2e4',
    '--compose-body-nav-background': '#e1e2e4',
    '--compose-active-color': '#007bff',
    '--compose-link-color': '#bdbac2',
    '--compose-icon-color': '#bdbac2',
    '--compose-font-color': '#212529',
    '--compose-mute-font-color': '#bdbac2',
    '--compose-input-font-color': '#76839f',
    '--compose-header-color': '#76839f',
    '--compose-tab-background-color': '#2339ff',
    '--compose-tab-font-color': '#fff',
    '--compose-input-background-color': '#fff',
    '--compose-submit-button-color': '#007bff',
    '--compose-active-submit-button-color': '#007bff',

    '--compose-submit-button-color-2': '#007bff',
    '--compose-submit-button-border-color-2': '#fff',
    '--compose-active-submit-button-color-2': '#007bff',
    '--compose-active-submit-button-border-color-2': '#007bff',
    '--compose-input-background-color-2': '#fff',
    '--compose-active-input-border-color': '#007bff',
    '--compose-contacts-hover-background-color': '#f1f1f1',

    /* scrollbars */
    '--chat-scrollbar-track-color': '#bdbac2',
    '--chat-scrollbar-thumb-color': '#007bff',
    '--chat-scrollbar-color': 'transparent',

    '--compose-scrollbar-track-color': '#bdbac2',
    '--compose-scrollbar-thumb-color': '#007bff',
    '--compose-scrollbar-color': 'transparent',


    '--auth-modal-background-color': '#fff',
    '--auth-background-color': '#fff',
    '--auth-box-shadow': '0 2px 6px rgba(0, 0, 0, 0.30), 0 4px 10px rgba(0, 0, 0, 0.30)',
    '--auth-header-font-color': '#76839f',
    '--auth-input-font-color': '#76839f',
    '--auth-input-background-color': '#fff',
    '--auth-input-active-border-color': '#007bff',
    '--auth-switch-modal-font-color': '#007bff',
    '--auth-submit-button-color': '#fff',
    '--auth-submit-button-border-color': '#4f608a',
    '--auth-submit-font-color': '#4f608a',
    '--auth-active-submit-button-color': '#007bff',
    '--auth-active-submit-button-border-color': '#007bff',
    '--auth-active-submit-button-font-color': '#fff',
    '--auth-mobile-modal-background-color': '#fff',

};

let dark_theme_colors = {
    /* links and icons */
    '--link-color': '#fff',
    '--icon-color': '#bdbac2',

    /* radio buttons */
    '--active-radio-color': '#00f890',
    '--active-link-color': '#8725c7',

    /* navigation */
    '--navigation-background': '#111620',
    '--navigation-circle-box-shadow': '#4e182e',
    '--navigation-active-icon': '#f6305e',

    /* sidebar */
    '--sidebar-background-color': '#1a202f',
    '--sidebar-discussion-chat-color': '#171d2a',
    '--sidebar-active-chat-gradient-color-1': '#f6305e',
    '--sidebar-active-chat-gradient-color-2': '#8725c7',
    '--sidebar-friend-color': '#171d2a',
    '--sidebar-friend-icon-color': '#8725c7',
    '--sidebar-notifications-color': '#171d2a',
    '--sidebar-notifications-icon-color': '#8725c7',
    '--sidebar-settings-highlight-color': '#8725c7',

    '--sidebar-mobile-menu-icon-color': '#4f608a',
    '--sidebar-mobile-menu-background': '#1a202f',
    '--sidebar-mobile-menu-font-color': '#fff',
    '--sidebar-mobile-menu-icons-color': '#fff',


    /* search form */
    '--search-form-input-background-color': '#141a28',
    '--search-form-input-font-color': '#4f608a',
    '--search-form-input-hover-color': '#efebeb',
    '--search-form-input-border-color': '#f5f5f5',

    /* forms */
    '--form-input-background-color': '#21293c',
    '--form-input-font-color': '#4f608a',
    '--form-input-border': '#efebeb',
    '--form-input-hover': '#f5f5f5',
    '--form-input-focus-color': '#8725c7',
    '--checked-input-color': '#8725c7',
    '--submit-button-color': '#8725c7',

    /* borders*/
    '--hr-border-color': '#fbfbfb',

    /* chat */
    '--chat-top-background': '#141a28',
    '--chat-background-color': '#1a202f',
    '--chat-bottom-background': '#161c2a',
    '--chat-border-color': '#f9f9f9',
    '--chat-top-icon-color': '#7b8ebc',
    '--chat-odd-message-gradient-color-1': '#ff9b5d',
    '--chat-odd-message-gradient-color-2': '#fe3b56',
    '--chat-self-message-gradient-color-1': '#f7305d',
    '--chat-self-message-gradient-color-2': '#8324ca',
    '--chat-message-font-color': '#ffffff',


    /* utility */
    '--utils-background-color': '#111620',


    /* compose */
    '--compose-header-background': '#f6305e',
    '--compose-body-nav-background': '#1a202f',
    '--compose-active-color': '#007bff',
    '--compose-link-color': '#bdbac2',
    '--compose-icon-color': '#bdbac2',
    '--compose-font-color': '#212529',
    '--compose-mute-font-color': '#bdbac2',
    '--compose-input-background-color': '#21293c',
    '--compose-input-font-color': '#fff',
    '--compose-header-color': '#fff',
    '--compose-tab-background-color': '#f6305e',
    '--compose-tab-font-color': '#fff',
    '--compose-submit-button-color': '#f6305e',
    '--compose-submit-button-color-2': 'transparent',
    '--compose-submit-button-border-color-2': '#21293c',
    '--compose-active-submit-button-color-2': '#8725c7',
    '--compose-active-submit-button-border-color-2': '#8725c7',
    '--compose-active-submit-button-color': '#f6305e',
    '--compose-input-background-color-2': 'transparent',
    '--compose-active-input-border-color': '#8725c7',
    '--compose-contacts-hover-background-color': '#21283a',

    /* scrollbars */
    '--chat-scrollbar-track-color': '#111620',
    '--chat-scrollbar-thumb-color': '#f6305e',
    '--chat-scrollbar-color': 'transparent',

    '--compose-scrollbar-track-color': 'transparent',
    '--compose-scrollbar-thumb-color': '#f6305e',
    '--compose-scrollbar-color': 'transparent',


    /* auth modals */
    '--auth-modal-background-color': '#1a202f',
    '--auth-background-color': '#111620',
    '--auth-box-shadow': 'none',
    '--auth-header-font-color': '#fff',
    '--auth-input-font-color': '#4f608a',
    '--auth-input-background-color': 'transparent',
    '--auth-input-active-border-color': '#8725c7',
    '--auth-switch-modal-font-color': '#8725c7',
    '--auth-submit-button-color': '#111620',
    '--auth-submit-button-border-color': '#4f608a',
    '--auth-submit-font-color': '#4f608a',
    '--auth-active-submit-button-color': '#8725c7',
    '--auth-active-submit-button-border-color': '#8725c7',
    '--auth-active-submit-button-font-color': '#fff',
    '--auth-mobile-modal-background-color': '#111620',

    /* font colors */
    '--plain-font-color': '#ffffff',
    '--mute-font-color': '#76839f',
};
