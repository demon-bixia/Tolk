/*
*
* a module containing screen and effects method methods
* each method should be heavily commented
* also used for animation
*
* */
export class Wizard {
    /*
    * adds basic animation and screen effects
    *  */

    constructor(component_factory) {
        this.factory = component_factory;
    }

    fadeIn(htmlElement) {
        let opacity = 0;

        htmlElement.style.opacity = 0;
        htmlElement.style.display = 'block';

        let intervalID = setInterval(function () {
            if (opacity < 1) {
                opacity = opacity + 0.1;
                htmlElement.style.opacity = opacity;
            } else {
                clearInterval(intervalID);
            }
        }, 100);
    }

    fadeOut(htmlElement) {
        let opacity = 1;
        htmlElement.display.opacity = 1;

        let intervalID = setInterval(function () {
            if (opacity > 0) {
                opacity = opacity - 0.1
                htmlElement.style.opacity = opacity;
            } else {
                htmlElement.style.display = 'none';
                clearInterval(intervalID);
            }
        }, 200);
    }


    progressFill(htmlElement, delay, callback) {
        let width = 0;

            setTimeout(function () {
                let intervalID = setInterval(function () {
                    if (width < 100) {
                        width++;
                        htmlElement.style.width = width + "%";
                    } else {
                        clearInterval(intervalID);
                        callback();
                    }
                }, 10);
            }, delay)
    }


    hide(htmlElement) {
        htmlElement.classList.remove('active'); // removes class active
        htmlElement.style.display = 'none';
    }


    toggle(htmlElement) {
        if (htmlElement.classList.contains('active')) {
            htmlElement.classList.remove('active');
            htmlElement.style.display = 'none';
        } else {
            htmlElement.classList.add('active');
            htmlElement.style.display = '';
        }
    }

    hideUntil(htmlElement, seconds) {
        if (seconds) {
            if (typeof seconds === 'number') {
                htmlElement.classList.remove('active'); // removes class active
                htmlElement.style.display = 'none';

                setTimeout(() => {
                    htmlElement.classList.add('active'); // add class active
                    htmlElement.style.display = '';
                }, seconds)
            } else {
                throw new Error(`seconds is Number not ${typeof seconds}`);
            }
        } else {
            throw new Error('Expected args not provided');
        }
    }

    show(htmlElement) {
        htmlElement.classList.add('active'); // add class active
        htmlElement.style.display = '';
    }

    showUntil(htmlElement, seconds) {
        if (seconds) {
            if (typeof seconds === 'number') {
                htmlElement.classList.add('active'); // add class active
                htmlElement.style.display = '';

                setTimeout(() => {
                    htmlElement.classList.remove('active'); // removes class active
                    htmlElement.style.display = 'none';
                }, seconds)
            } else {
                throw new Error(`seconds is Number not ${typeof seconds}`);
            }
        } else {
            throw new Error('Expected args not provided');
        }
    }

    switchTo(to_element, from_elements) {
        if (to_element) {
            this.show(to_element); // show to component

            for (let element of from_elements) {
                // loop over switch from component names and hide them
                this.hide(element);
            }
        }
    }
}