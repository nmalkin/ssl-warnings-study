import crypto = require('crypto');

import browser_detect = require('./browser');
import conditions = require('./conditions');
import events = require('./events');
import view = require('./view');

/**
 * Make sure every user has a session token and is assigned a condition
 */
export function sessionManager(req : Express.Request, res, next) {
    if(! req.session.id) {
        req.session.id = crypto.randomBytes(64).toString('hex');
    }

    if(! req.session.condition) {
        req.session.condition = conditions.assignNext();
        events.trackInternal(req, 'condition', conditions.asString(req.session.condition));
    }

    next();
}

/**
 * Show the warning
 */
export function warning(req, res) {
    var browser : browser_detect.Browser;

    // Decide which browser warning to serve
    if('browser' in req.query) {
        // Allow 'browser' query argument to override actual user agent
        browser = browser_detect.parseBrowser(req.query.browser);
    } else {
        browser = browser_detect.browserFromUseragent(req.headers['user-agent']);
    }

    events.trackInternal(req, 'browser', browser_detect.Browser[browser]);

    view.renderResponseForBrowser(browser, req, res);
}

/**
 * Show the unsafe page
 */
export function proceed(req, res) {
    events.trackInternal(req, 'proceed', (new Date()).toISOString());
    res.render('unsafe');
}

/**
 * Receive and record client-side events
 */
export function event(req, res) {
    var name = req.body.name;
    var value = req.body.value;
    // TODO: external event whitelist?

    events.trackExternal(req, name, value);

    res.send('OK');
}
