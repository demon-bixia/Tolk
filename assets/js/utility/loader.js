export function hide_loader() {
    $('.loader').removeClass('active');
}

export function show_loader() {
    $('.loader').addClass('active');
}

export function show_loader_for_3s() {
    $('.loader').addClass('active');
    setTimeout(function () {
        $('.loader').removeClass('active');
    }, 3000)
}

export function hide_loader_after_3s() {
    setTimeout(function () {
        $('.loader').removeClass('active');
    }, 3000)
}
