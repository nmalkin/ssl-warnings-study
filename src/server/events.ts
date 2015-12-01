enum EventSource { External, Internal };

function recordEvent(req, source : EventSource, name : string, value : string) : void {
    var record = {
        ip: req.ip,
        name: name,
        session: req.session.id,
        source: EventSource[source],
        timestamp: (new Date()).toISOString(),
        useragent: req.headers['user-agent'],
        value: value,
    }
    console.log(record);
}

export function trackExternal(req, event : string, value : string) : void {
    recordEvent(req, EventSource.External, event, value);
}

export function trackInternal(req, event : string, value : string) : void {
    recordEvent(req, EventSource.Internal, event, value);
}
