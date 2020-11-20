export class Renderer {
    /*
    renders html components in index.htm
    */

    constructor(component_factory) {
        this.factory = new component_factory();
    }

    static renderNegotiation(kwargs = {"component": null, 'selector': null}) {
        /*
        * selects the best render method (append, replace, prepend)
        * based on component
        * */
        let component = kwargs['component'];
        let selector = kwargs['selector'];
        let element;

        switch (component['render_mode']) {
            case 'append':
                // return append
                return 'append';
            case 'replaceOrAppend':
                // search html page for element
                if (selector) {
                    element = document.querySelector(selector);
                } else {
                    element = document.querySelector(component['selector']);
                }

                if (element) {
                    // if element exist replace
                    return 'replace';
                } else {
                    // if element dose not exist append
                    return 'append';
                }
            case 'prepend':
                // return replace
                return 'prepend';
            case 'replaceOrPrepend':
                // search html page for element
                if (selector) {
                    element = document.querySelector(selector);
                } else {
                    element = document.querySelector(component['selector']);
                }

                if (element) {
                    // if element exist replace
                    return 'replace';
                } else {
                    // if element dose not exist append
                    return 'prepend';
                }
            default:
                // if no render mode then component is invalid
                throw new Error('invalid render mode');
        }
    }

    static renderComponent(kwargs = {
        "component": null,
        "render_method": null,
        "refresh": null,
        'container': null,
        'selector': null
    }) {
        /* renders component to html document */
        let component = kwargs['component'];
        let render_method = kwargs['render_method'];
        let refresh = kwargs['refresh'];
        let container_selector = kwargs['container'];
        let element_selector = kwargs['selector'];
        let element, container;

        if (!component && render_method) {
            throw new Error("Expected args not provided");
        } else {
            return new Promise(function (resolve, reject) {
                switch (render_method) {
                    case "append":
                        if (container_selector) {
                            container = document.querySelector(container_selector);
                        } else {
                            container = document.querySelector(component['container']);
                        }
                        // look for element container and append element
                        if (container) {
                            if (refresh) {
                                container.innerHTML = '';
                            }
                            container.append(component['element']);
                            resolve(component['element']);
                        } else {
                            throw new Error('append container not found');
                        }
                        break;
                    case "prepend":
                        // look for element container and prepend element
                        if (container_selector) {
                            container = document.querySelector(container_selector);
                        } else {
                            container = document.querySelector(component['container']);
                        }
                        if (container) {
                            if (refresh) {
                                container.innerHTML = '';
                            }
                            container.prepend(component['element']);
                            resolve(component['element']);
                        } else {
                            throw new Error('prepend container not found');
                        }
                        break;
                    case "replace":
                        // look for element and replace element
                        element = document.querySelector(component['selector']);

                        if (element_selector) {
                            element = document.querySelector(element_selector);
                        } else {
                            element = document.querySelector(component['selector']);
                        }

                        if (element) {
                            element.replaceWith(component['element']);
                            resolve(component['element']);
                        } else {
                            throw new Error('replace element not found');
                        }
                        break;
                    default:
                        reject(new Error('don\'t know how to apply render mode'));
                        break;
                }
            });
        }
    }

    render(kwargs = {
        "component_name": null,
        'data': null,
        'before_render': null,
        'refresh': null,
        'container': null,
        'selector': null
    }) {
        /*
        *used to render components
        */
        let component_name = kwargs['component_name'];
        let before_render = kwargs['before_render'];
        let data = kwargs['data'];
        let refresh = kwargs['refresh'];
        let container = kwargs['container'];
        let selector = kwargs['selector'];

        if (!component_name) {
            // if called with missing args throw error
            throw new Error("must provide component name in order to render");
        } else {
            // create component using component factory
            return this.factory.create({'component_name': component_name, 'data': data})
                .then((component) => {
                    return new Promise(function (resolve, reject) {
                        // pre form render negotiation
                        let render_method = Renderer.renderNegotiation({
                            "component": component,
                            'selector': selector || null
                        });

                        // used to setup animation by user and element specific props
                        if (before_render) {
                            before_render(component);
                        }

                        // render component
                        Renderer.renderComponent({
                            'component': component || null,
                            "render_method": render_method || null,
                            "refresh": refresh || null,
                            'container': container || null,
                            'selector': selector || null,
                        }).then(function (element) {
                            // resolve promise if component is rendered
                            resolve(element, data);
                        }, function (error) {
                            reject(error);
                        });
                    });
                })
        }
    }
}


// used as abstract class to communicate between renderer module
// and web component libraries modules
export class AbstractComponentFactory {
    create(kwargs = {'component_name': null, 'data': null}) {
        // creates a component and returns a component pack
    }
}
