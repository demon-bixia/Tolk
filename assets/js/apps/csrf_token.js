/* returns the csrf token used for unsafe methods
   POST, DELETE, PUT */
export function getCsrfCookie() {
    let cookieValue = null;
    let name = "csrftoken";
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


/* checks the given method for safety */
export function csrfSafeMethod(method) {
    return (/^(GET|OPTIONS|TRACE|HEAD)$/.test(method));
}