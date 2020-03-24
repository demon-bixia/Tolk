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
    '--chat-message-font-color': '##252525',

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
    '--auth-active-submit-button-color': '#007bff',
    '--auth-active-submit-button-border-color': '#007bff',

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
    '--auth-active-submit-button-color': '#8725c7',
    '--auth-active-submit-button-border-color': '#8725c7',

    '--auth-mobile-modal-background-color': '#111620',

    /* font colors */
    '--plain-font-color': '#ffffff',
    '--mute-font-color': '#76839f',
};

