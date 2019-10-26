/* tells if the user is authenticated of not */

export function userAuthenticated() {
    return $.ajax({
        url: 'accounts/authenticated/',
        type: 'get',
        dataType: 'json',

    });
}
