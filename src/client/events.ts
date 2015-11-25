interface TrackingEvent {
    name: string,
    value: string
}

function sendEvent(e : TrackingEvent) {
    var req = new XMLHttpRequest();
    req.open('POST', '/event');
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send(JSON.stringify(e));
}

function listenForClicks() {
    var elements = document.querySelectorAll('[data-track]');
    Array.prototype.forEach.call(elements, function(element) {
        var eventName : string = element.attributes['data-track'].value;
        element.addEventListener('click', function(e) {
            var event = {
                name: eventName,
                value: (new Date()).toISOString()
            };
            sendEvent(event);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    listenForClicks();
});
