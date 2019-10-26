/* Authentication app */

import {hide_loader, hide_loader_after_3s, show_loader} from "../utility/loader.js";
import {csrfSafeMethod, getCsrfCookie} from "./csrf_token.js";
import {switchActivate, switchLogin} from "../utility/screen_switching.js";
import {userAuthenticated} from "../utility/base_authenticated.js";
import {showErrors} from "../utility/form_validation.js";

/* gets csrf token */
let csrftoken = getCsrfCookie();


/* a promise that resolves if auth is true */
export function authenticate() {
    let promise = $.Deferred();
    userAuthenticated().then(function (data) {
        if (data['authenticated']) {
            promise.resolve(true);
        } else {
            promise.reject(false);
        }
    }, function (data) {
        console.log('failed'); /* for debug purposes */
        promise.reject('failed');
    });
    return promise.promise();
}

/* LoginEvent */
export function loginEvent() {
    let promise = $.Deferred();

    let form = $("#Login form");
    loginAjaxRequest(form)
        .then(function (data) {
            if (data['success']) {
                $.when(authenticate()).then(function (event) {
                    promise.resolve('user logged in');
                }, function (event) {
                    /* show form again */
                    switchLogin();
                    hide_loader_after_3s();

                    promise.reject('request error')
                });
            } else {
                /* show errors on form */
                showErrors(data, form);
                hide_loader_after_3s();

                promise.reject('bad credentials')
            }
        }, function (status) {
            hide_loader_after_3s();
        });

    return promise;
}

/* Make authentication ajax requests*/
function loginAjaxRequest(form) {
    return $.ajax({
        url: form.attr('action'),
        type: 'post',
        dataType: 'json',
        data: form.serialize(),
        beforeSend: function (xhr, settings) {
            show_loader();
            /* adds the csrf token if method is not safe */
            csrftoken = getCsrfCookie();
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        error: () => {
            console.error('request failed'); /* for debug purposes*/
        }
    });
}

export function logoutEvent() {
    logoutAjaxRequest()
        .then(function (data) {
            if (data['success']) {
                switchLogin();
                hide_loader();
            } else {
                console.log('logout failed') /* for debug purposes */
            }
        });
}

/* Make logout ajax request */
function logoutAjaxRequest(url) {
    return $.ajax({
        url: 'accounts/logout/',
        type: 'get',
        dataType: 'json',
        beforeSend: function (e) {
            show_loader();
        }
    });
}


/* account creation and update */

/* RegisterEvent */
export function registerEvent(event) {
    event.preventDefault();
    let form = $("#Register form");

    registrationAjaxRequest(form)
        .then(function (data) {
            if (data['success']) {
                /* add user's email link  */
                let link = $('#Activate a');
                link.attr('href', `https://${data['email']}`);
                link.html(data['email']);

                /* go to email activation screen */
                switchActivate();
            } else {
                showErrors(data, form);
            }
            hide_loader();
        });
}


/* Make registration ajax requests*/
function registrationAjaxRequest(form) {

    return $.ajax({
        url: form.attr('action'),
        type: 'post',
        dataType: 'json',
        data: form.serialize(),
        beforeSend: function (xhr, settings) {
            show_loader();
            /* adds the csrf token if method is not safe */
            csrftoken = getCsrfCookie();
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        error: () => console.log('request failed') /* for debug purposes */
    });
}

/* handle account updates */
export function updateEvent(event) {
    let form = $("#settings .account");
    event.preventDefault();
    updateAjaxRequest(form)
        .then(function (data) {
            if (data['success']) {
                console.log('success');
            } else {
                showErrors(data, form);
            }
        })
}

/* request for updating account */
function updateAjaxRequest(form) {


    return $.ajax({
        url: "accounts/update/",
        type: "post",
        data: form.serialize(),
        beforeSend: function (xhr, settings) {
            /* gets csrf token */
            csrftoken = getCsrfCookie();
            /* adds the csrf token if method is not safe */
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        error: () => {
            console.log('request failed')
        },
        /* for debug purposes */
    })
}

/* handle profile pic upload */
export function contactPicUploadEvent(event) {
    if ($(this).attr('id') === "fileupload") {
        $("#fileupload").fileupload({
            done: function (event, data) {
                /* update contact */
                load('CONTACT', null, false)
            }
        });

        $('.profile-picture').trigger('picture-changed');
    }
}