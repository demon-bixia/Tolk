/* listen to events and handle behavior */
import {contactPicUploadEvent, loginEvent, logoutEvent, registerEvent, updateEvent} from "./apps/authentication.js";
import {switching} from "./utility/screen_switching.js";
import {chat, send} from "./apps/chat.js";
import {load} from "./apps/loader.js";
import {run} from "./apps/main.js";


$(function () {

    eva.replace();


    /* listens to account update Event */
    $('#settings .account').on('submit', updateEvent);

    /* listens to the file upload event */
    $("body").on('click', '#fileupload', contactPicUploadEvent);

    /* profile pic upload */
    $(".navigation .profile-picture").on('click', function () {
        let fileupload = $('#fileupload');
        fileupload.click();
    });


    $('.chat .tab-content').on('click', 'button[data-utility="open"]', function () {
        let conversation_name = $(this).attr('data-conversation');
        $(`#${conversation_name} .utility`).toggleClass('open');
    });

    /* adds event for modal footer button so they can submit there forms */
    $('.modal .modal-footer button[type="submit"]').on('click', function () {
        let target = $(this).attr('data-target');
        let form = $(`${target}`);
        form.submit();
    });

    /* remove errors on modal forms once input is changed */
    $('.modal form input').on('focus', function (event) {
        let parent = $(this).parent();
        parent.removeClass('error'); /* remove error red highlight */
        $(this).siblings('.error_container').html(''); /* remove error messages */
    });

    switching();

    /* listen to login event */
    $('#Login form').on('submit', function (event) {
        event.preventDefault();

        /* login user */
        $.when(loginEvent()).then(function (status) {
            /* run all apps again */
            console.info(status);
            run();
        });

    });

    /* listen to logout event */
    $('#Logout').on('click', function (event) {
        event.preventDefault();

        /* log user out */
        logoutEvent();

        /* close sockets */
        chat(false, 'CLOSE');
        load('CLOSE', null, false);
    });

    /* listen to register event */
    $('#Register form').on('submit', registerEvent);


    /* what happens when you click a conversation */
    $('#conversations').on('click', 'li', function () {
        let conversation_name = $(this).find('a').attr('data-name');

        /* scroll chat to bottom */
        let chat = document.querySelector(`#${conversation_name}`);
        let chat_middle = chat.querySelector('.middle');
        chat_middle.scrollBy(0, chat_middle.scrollHeight);
    });


    /* get chat container */
    let chatContainer = $('.chat');

    /* send message when if send button is clicked */
    chatContainer.on('click', 'button.send', function (event) {
        if ($(this).siblings('.form-control').val().trim().length !== 0) {
            let message = $(this).siblings('.form-control').val();
            let conversation_name = $(this).attr('data-conversation');
            send({
                "command": "MESSAGE",
                "conversation_name": conversation_name,
                "message": message,
            });
            $(this).siblings('.form-control').val('');
        }
    });

    /* send message if enter or return key was clicked */
    chatContainer.on('keyup', '.bottom form textarea', function (event) {
        if (event.key === "Enter" || event.key === "Return") {
            if ($(this).val().trim().length !== 0) {
                let conversation_name = $(this).siblings('.prepend').attr('data-conversation');
                let message = $(this).val();
                send({
                    "command": "MESSAGE",
                    "conversation_name": conversation_name,
                    "message": message
                });
            }
            $(this).val('');
        }
    });
});
