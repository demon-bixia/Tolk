export class Communicator {
    /*
    * facilitates communication between other modules and this
    * module
    * */
    constructor(router) {
        this.ajax = new AjaxCommunicator(); // create ajax communication instance
        this.socket = new SocketCommunicator(); // create socket communication instance
        this.router = router;
        this.socket.receive = data => this.on_receive(data);
    }

    send_ajax(options = {
        'route_name': null,
        'args': null,
        'type': null,
        'accept': null,
        'data': null
    }) {
        if (!options['route_name']) {
            throw Error('Expected args not provided');
        } else {
            if (options['args'] && options['args'].constructor !== Array) {
                throw new Error(`args expected type is array not ${options['args'].constructor}`);
            } else {
                if (options['args']) {
                    // get route using router
                    options['route'] = this.router.getRoute(options['route_name'], ...options['args']);
                } else {
                    // get route using router
                    options['route'] = this.router.getRoute(options['route_name']);
                }
                // send request
                return this.ajax.send(options);
            }
        }
    }

    connect_socket(route_name) {
        let route = this.router.getRoute(route_name, []);
        if (route.protocol !== 'websockets') {
            throw new Error('Invalid Route')
        } else {
            return this.socket.connect(route.url);
        }
    }

    on_receive() {
        // event wrapper
    }

    send_socket(data) {
        this.socket.send(data)
    }

    send_json_socket(data) {
        this.socket.send(JSON.stringify(data));
    }

    disconnect_socket() {
        this.socket.disconnect();
    }

    socket_is_open() {
        return this.socket.is_open();
    }
}

class AjaxCommunicator {
    /*
    * sends and receives http requests using ajax method
    **/

    static addToken(kwargs = {'route': null, 'xhr': null}) {
        /*
        * open xhr request and add headers
        * */
        let route = kwargs['route'];
        let xhr = kwargs['xhr'];

        if (route) {
            // if method is not safe
            if (!AjaxCommunicator.csrfSafeMethod(route['method'])) {
                // get csrf token
                let csrftoken = AjaxCommunicator.getCsrfCookie();
                // add csrf token to request header
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        } else {
            throw new Error('Expected args not provided');
        }
    }

    static getCsrfCookie() {
        /*
        * get csrf token from cookies
        * */
        return Cookies.get('csrftoken');
    }

    static csrfSafeMethod(method) {
        /*
        * check if request is csrf token safe
        * */
        return (/^(GET|OPTIONS|TRACE|HEAD)$/.test(method));
    }

    send(kwargs = {'route': null, 'data': null, 'type': null, 'accept': null}) {
        /* send ajax request */
        let route = kwargs['route'];
        let data = kwargs['data'];
        let type;
        let accept;

        if (!kwargs['type'] && kwargs['type'] !== false) {
            type = 'application/json';
        } else {
            type = kwargs['type'];
        }

        if (!kwargs['accept'] && kwargs['accept'] !== false) {
            accept = 'application/json';
        } else {
            accept = kwargs['accept'];
        }


        if (route) {
            let xhr = new XMLHttpRequest();

            // open request and add method and url
            xhr.open(route['method'], route['url'], true);

            /* runs header configuration */
            AjaxCommunicator.addToken({"route": route, 'xhr': xhr});

            // set type header
            if (type) {
                // set headers
                xhr.setRequestHeader('Content-Type', type);
            }

            // set accept header
            if (accept) {
                xhr.setRequestHeader('Accept', accept);
            }

            return new Promise(function (resolve, reject) {

                if (data) {
                    if (!data.constructor === Object) {
                        reject(new Error(`Expected String or FormData got ${data.constructor}`))
                    } else {

                        if (type === 'application/json') {
                            let serialized_data = JSON.stringify(data);
                            xhr.send(serialized_data);
                        } else {
                            xhr.send(data)
                        }
                    }
                } else {
                    xhr.send();
                }

                // runs when request is finished
                xhr.onreadystatechange = function (event) {
                    // state 4 means finished
                    if (xhr.readyState === 4) {
                        // when response is larger that 200 and smaller than 300
                        // resolve promise
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            if (accept === 'application/json') {
                                resolve(JSON.parse(xhr.responseText));
                            } else {
                                resolve(xhr.responseText);
                            }
                        } else {
                            // when response code is from 400 to 500 reject promise
                            // with response text if available
                            if (xhr.responseText) {
                                if (accept === 'application/json') {
                                    if (xhr.status === 413) {
                                        reject({'status': xhr.status, 'data': xhr.responseText});
                                    } else {
                                        reject({'status': xhr.status, 'data': JSON.parse(xhr.responseText)});
                                    }
                                } else {
                                    reject({'status': xhr.status, 'data': xhr.responseText});
                                }
                            } else {
                                reject({'status': xhr.status});
                            }
                        }
                    }
                };

                xhr.onerror = function (event) {
                    // runs when xhr faces a connection error
                    throw new Error('Network Error');
                }
            });

        } else {
            throw new Error('Expected args not provided');
        }
    }
}


class SocketCommunicator {

    socket;

    set socket(value) {
        if (this.socket) {
            // disconnect from old socket before connecting
            // to new one
            this.socket.close();
        }
    }

    connect(url) {
        if (!url) {
            throw new Error('Expected args not provided');
        } else {
            let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";  // figure out the correct scheme
            let ws_path = ws_scheme + '://' + window.location.host + url; // create the connection url path
            let socket = new WebSocket(ws_path); // make sure you change this to module imports
            socket.binaryType = "arraybuffer"; // set the the binary type to array buffer (used to represent fixed length raw binary data)

            // add reference to socket object
            this.socket = socket;

            socket.onmessage = event => this.receive(event['data']); // receive event
            socket.onclose = event => this.disconnect(this.socket); // close event

            return new Promise(function (resolve, reject) {
                socket.onopen = event => resolve();
                socket.onerror = event => reject(event);
            });
        }
    }

    send(data) {
        // used to send data via socket
        if (!data) {
            throw new Error('Expected args not provided');
        } else {
            this.socket.send(data); // stringify object and send it
        }
    }

    receive(data) {
        // simple WebSocket.onmessage event
    }

    disconnect(socket) {
        console.log("socket disconnected");
        // disconnect web socket object
        this.socket.close();
    }

    is_open() {
        // returns true is a socket connection is opened
        return this.socket.readyState === WebSocket.OPEN;
    }
}

export class AbstractRouter {
    getRoute(route_name, ...args) {
        /*
        * returns a request Object
        * */
    }

    constructUrl(pattern, ...args) {

    }
}
