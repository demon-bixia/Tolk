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