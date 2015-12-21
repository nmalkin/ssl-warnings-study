import database = require('./database');

enum EventSource { External, Internal };

function setupDatabase() {
    database.execute(`CREATE TABLE IF NOT EXISTS events
                          (id INT NOT NULL AUTO_INCREMENT,
                           timestamp VARCHAR(128),
                           ip VARCHAR(64),
                           useragent VARCHAR(256),
                           session VARCHAR(128),
                           source VARCHAR(32),
                           name VARCHAR(256),
                           value TEXT,
                           PRIMARY KEY (id))`, [null]);
}

function recordEvent(req, source : EventSource, name : string, value : string) : void {
    var record = {
        ip: req.ip,
        name: name,
        session: req.session.id,
        source: EventSource[source],
        timestamp: (new Date()).toISOString(),
        useragent: req.headers['user-agent'],
        value: value,
    };

    console.log(record);
    database.execute('INSERT INTO events SET ?', record);
}

export function trackExternal(req, event : string, value : string) : void {
    recordEvent(req, EventSource.External, event, value);
}

export function trackInternal(req, event : string, value : string) : void {
    recordEvent(req, EventSource.Internal, event, value);
}

/**
 * Tracks the given event name, with the current timestamp as the payload
 */
export function trackInternalMoment(req, event : string) : void {
    trackInternal(req, 'proceed', (new Date()).toISOString());
}

setupDatabase();
