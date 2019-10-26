/* a function that shows errors on a given form */
export function showErrors(data, form) {
    let form_errors = data['form_errors'];
    for (let field_name of Object.keys(form_errors)) {
        let field = form.find(`input[name="${field_name}"]`);
        let parent = field.parent();
        let errors = form_errors[`${field_name}`];
        let error_container = parent.find('.error_container');

        /* change style of form-group  */
        parent.addClass('error');

        /* empty error container */
        error_container.html('');

        /* show error */
        for (let error_msg of errors) {
            /* show errors */
            error_container.append(
                `<small class="error-message">${error_msg}</small>`
            );
        }
    }
}
