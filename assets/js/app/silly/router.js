/*
* contains a router implementation and an
* object containing routes
* */
import { AbstractRouter } from './communication.js';

export class Router extends AbstractRouter {
    /* 
    * an implementation of Abstract router 
    * finds correct routes in the routes object and
    * and if they happen to have a url it constructs it
    * */

    constructor(routes) {
        super();
        this.routes = routes;
    }

    getRoute(route_name, ...args) {
        /*
        *  finds the correct route in routes object and
        *  calls construct url for the protocol that has
        *  a url_pattern inside it finally return the a copy
        *  of the route object to be used
        * */
        if (!route_name) {
            throw new Error('Expected args not provided');
        } else {
            // get the route from the routes object
            let route = this.routes[route_name];

            if (!route) {
                throw new Error('route dose not exist');
            } else {
                // if protocol http construct url inside route and return
                // copy object
                if (route.protocol.match(/http/i) && route['method'] && route['url_pattern']) {
                    return {
                        'protocol': route['protocol'],
                        'method': route['method'],
                        'url': window.location.protocol + "//" + window.location.host + this.constructUrl(route['url_pattern'], args)
                    }
                } else if (route['protocol'].match(/websocket/i) && route['url']) {
                    // if protocol websocket return a copy object of route
                    return {
                        'protocol': route['protocol'],
                        'url': route['url'],
                    }
                } else {
                    throw new Error('Invalid url');
                }
            }
        }
    }

    validate_url(url_pattern) {
        /*
        * contains url validation script
        * that checks if url_pattern is valid to be used by constructURl
        * */
        if (!url_pattern.match(/^\//)) {
            // first if slash exists
            throw new Error('Missing beginning slash in url');

        } else if (!url_pattern.match(/\/$/)) {
            // check if last slash exists
            throw new Error('Missing the last slash in url');

        } else if (url_pattern.match(/<[0-9][A-Za-z0-9_]+>\//)) {
            // check for parameter with name starting with number or things other that text
            throw new Error(`url parameter ${url_pattern.match(/<[\W0-9][A-Za-z0-9_]*>\//g)} name can only start with letter [a-zA-Z]`);
        }
    }

    constructUrl(url_pattern, ...args) {
        /*takes a list of arguments and a url_pattern runs validations on the url_patter
        * and then fills if url_pattern has parameters it fills the url_pattern
        * with args from the arguments list
        **/

        // runs validation scripts
        this.validate_url(url_pattern);

        // extract an array of the url parameters from url pattern
        let url_parameters = url_pattern.match(/<[A-Za-z][A-Za-z0-9_]+>\//g);
        // if there are url parameters replace parameters with values
        // else return url pattern to be used as url
        if (url_parameters) {
            // loop for the length  of args
            for (let count = 0; count < args[0].length; count++) {
                // if there is no parameter for the arguments throw error
                if (!url_parameters[count]) {
                    throw new Error("Too much arguments")
                } else {
                    // get the url name from the url pattern
                    let url_parameter_name = url_parameters[count].match(/[A-Za-z][A-Za-z0-9_]+/)[0];
                    // if url parameter has no name then pattern is invalid
                    if (!url_parameter_name) {
                        throw new Error('invalid url pattern');
                    } else {
                        // replace parameter with arguments
                        url_pattern = url_pattern.replace(new RegExp(`<${url_parameter_name}>`), args[0][count]);
                    }
                }
            }
        }
        return url_pattern; // return constructed pattern
    }
}

