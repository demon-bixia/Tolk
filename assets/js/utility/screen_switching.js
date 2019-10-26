export function switching() {
    /* listen to form switching events */
    $('.switch-form .switch-register').on('click', switchRegister);
    $('.switch-form .switch-login').on('click', switchLogin);
}

export function switchRegister(e) {
    showRegister();
    hideLogin();
    hideActivate();
}

export function switchLogin(e) {
    showLogin();
    hideRegister();
    hideActivate();
}

export function switchActivate() {
    showActivate();
    hideLogin();
    hideRegister();
}

export function switchHome() {
    hideLogin();
    hideRegister();
    hideActivate();
}


/* utility functions */

export function hideLogin() {
    $("#Login").removeClass('active');
}

export function hideRegister() {
    $("#Register").removeClass('active');
}

export function hideActivate() {
    $("#Activate").removeClass('active');
}

export function showLogin() {
    $("#Login").addClass('active');
}

export function showRegister() {
    $("#Register").addClass('active');
}

export function showActivate() {
    $("#Activate").addClass('active');
}
