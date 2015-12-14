import crypto = require('crypto');

import browser_detect = require('./browser');
import conditions = require('./conditions');
import events = require('./events');
import view = require('./view');

/**
 * Make sure every user has a session token and is assigned a condition
 */
export function sessionManager(req, res, next) {
    // Get a unique session ID
    if(! req.session.id) {
        req.session.id = crypto.randomBytes(64).toString('hex');
    }

    // Establish the condition for this participant
    if(! req.session.condition) {
        req.session.condition = conditions.assignNext();
        events.trackInternal(req, 'condition',
            conditions.asString(req.session.condition));
    }

    // Detect the browser
    if(! req.session.browser) {
        req.session.browser = browser_detect.browserFromUseragent(req.headers['user-agent']);
        events.trackInternal(req, 'browser',
            browser_detect.Browser[req.session.browser]);
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
        browser = req.session.browser;
    }

    // A supported browser is one whose warning we can emulate.
    var supportedBrowser = (browser != browser_detect.Browser.Other);

    // Redirect user to HTTP or HTTPS version, depending on their browser
    if(req.secure && supportedBrowser) {
        // If the browser is supported, they should see an HTTP page.
        var redirectTarget = 'http://' + req.headers['host'];
        events.trackInternal(req, 'redirect', redirectTarget);
        res.redirect(redirectTarget);
    } else if(! (req.secure || supportedBrowser)) {
        // If the browser isn't supported, they should see an HTTPS page.
        var redirectTarget = 'https://' + req.headers['host'];
        events.trackInternal(req, 'redirect', redirectTarget);
        res.redirect(redirectTarget);
    } else {
        // If the user has the right combination of protocol and browser,
        // we can actually show them the warning (if appropriate).
        events.trackInternal(req, 'show_warning', browser_detect.Browser[browser]);
        view.renderResponseForBrowser(browser, req, res);
    }
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
