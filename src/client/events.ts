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

function sendTimestampEvent(name : string) : void {
    sendEvent({
        name: name,
        value: (new Date()).toISOString()
    });
}

function listenForClicks() {
    var elements = document.querySelectorAll('[data-track]');
    Array.prototype.forEach.call(elements, function(element) {
        var eventName : string = element.attributes['data-track'].value;
        element.addEventListener('click', function(e) {
            sendTimestampEvent(eventName);
        });
    });
}

function sendHeartbeat() : void {
    sendTimestampEvent('heartbeat');
}

document.addEventListener('DOMContentLoaded', function() {
    sendTimestampEvent('load');
    listenForClicks();
    window.setInterval(sendHeartbeat, 1000);
});
