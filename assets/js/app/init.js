/*
* initialize shared variables
* */

// handles hiding and showing elements and animations
import {Router} from "./silly/router.js";
import {Wizard} from "./silly/effects.js";
import {Communicator} from "./silly/communication.js"
import {Renderer} from "./silly/renderer.js";
import {ComponentFactory} from "./silly/component_lib.js";
import {routes} from './routes.js'
import {components} from "./components.js";

// handles animations and transitions
export let wizard = new Wizard();

// create a new router with our sites routes
let router = new Router(routes)

// the site uses only one communicator used to handle http and websocket communication
export let communicator = new Communicator(router);

// creates html elements from javascript templates supports ejs templating
let componentFactory =  new ComponentFactory(components)

// used to template and render html components
export let renderer = new Renderer(componentFactory);
