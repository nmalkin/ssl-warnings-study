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

function handleProceed() {
    // Find the element that triggers the next page
    document.querySelector('[data-proceed]')
    // Wait for it to be clicked
    .addEventListener('click', function(event) {
        event.preventDefault();

        // Report the action to the server
        var req = new XMLHttpRequest();
        req.open('POST', '/proceed');
        req.onload = function() {
            if(req.status === 200) {
                // Reload after hearing back
                window.location.reload(true);
            }
        }
        req.send();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    sendTimestampEvent('load');

    listenForClicks();
    handleProceed();
    window.setInterval(sendHeartbeat, 1000);
});
