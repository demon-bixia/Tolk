import {AbstractComponentFactory} from './renderer.js'

export class ComponentFactory extends AbstractComponentFactory {

    constructor(component_library) {
        super();
        this.component_library = component_library;
    }


    getComponent(component_name) {
        // returns a component model from the ComponentModels object below
        let componentModel = this.component_library[component_name];

        if (!componentModel) {
            throw new Error('No component model with the name ' + component_name)
        } else {
            return componentModel
        }
    }

    template(template_url, data) {
        /*
         uses ejs template engine to template a template string
         returns a templated js string
         note: it doesn't return html
        */

        // first get the template using dynamic imports
        return this.load(template_url)
            .then((template) => {
                try {
                    // template string and return the templated javascript string
                    return ejs.render(template, data);
                } catch (e) {
                    throw new Error('Templating Error' + e.message)
                }
            }, (e) => {
                throw new Error('Template not found' + e.message)
            })
    }

    async load(template_url) {
        /*
        * imports the string to be templated using template_url and dynamic imports.
        * then returns a resolved promise with the template string.
        * */
        let template_module = await import(template_url);
        return template_module.template;
    }

    strToHTML(str_element) {
        // converts strings to html using DOMParser object
        // if no browser support for DOMParser simply
        // renders html element inside div

        // check for browser support
        let support = (function () {
            // browser doesn't support dom parser return false
            if (!window.DOMParser) return false;

            // else create a new dummy parser
            let parser = new DOMParser();
            try {
                // try to parse the dummy string
                parser.parseFromString('x', 'text/html');
            } catch (err) {
                // if parse failed return false
                return false;
            }
            // if parse succeeded return true
            return true;
        })();

        // if dom parser is supported
        if (support) {
            // create a new dom parser
            let parser = new DOMParser();
            // parse text to html
            let doc = parser.parseFromString(str_element, 'text/html');
            // return the parsed element
            return doc.body.children[0];
        } else {
            // Otherwise, fallback to old-school method
            let dom = document.createElement('div');
            dom.innerHTML = str_element;
            return dom;
        }
    }

    create(kwargs = {'component_name': null, 'data': null}) {
        /*
            templates components and renders it to html
        */
        let component_name = kwargs['component_name'];
        let data = kwargs['data'];

        if (!component_name) {
            throw new Error("Expected args not provided!");
        } else {
            // get component model using the component name
            let componentModel = this.getComponent(component_name);
            // render the template inside the component
            return this.template(componentModel['template_url'], data)
                .then((htmlString) => {
                    // parse html string to an html element
                    let element = this.strToHTML(htmlString);
                    // return new component
                    return {
                        'container': componentModel['container'],
                        'selector': componentModel['selector'],
                        'element': element,
                        'render_mode': componentModel['render_mode'],
                    }
                })
        }
    }
}


