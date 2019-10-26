/* main.js */
/* an app that runs and describes the flow of applications */

import {switchLogin} from "../utility/screen_switching.js";
import {hide_loader} from "../utility/loader.js";
import {authenticate} from "./authentication.js";
import {load} from "./loader.js";
import {chat} from "./chat.js";

export function run() {
    /* Initialize The
    Authentication.js App */
    $.when(authenticate()).then(function (status) {
        /* Initialize The
        loader.js App */
        load('ALL', null, true);


        $("body").on('DataLoaded', () => {
            /* Initialize The
            chat.js App */
            chat(true);
        });

    }, function (status) {
        /* if user not logged in go login screen */
        switchLogin();
        hide_loader();
    });
}

/* run all apps */

run();