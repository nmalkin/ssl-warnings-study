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
    if(! ('id' in req.session)) {
        req.session.id = crypto.randomBytes(64).toString('hex');
    }

    // Establish the condition for this participant
    if(! ('condition' in req.session)) {
        req.session.condition = conditions.assignNext();
        events.trackInternal(req, 'condition',
            conditions.asString(req.session.condition));
    }

    // Detect the browser
    if(! ('browser' in req.session)) {
        req.session.browser = browser_detect.browserFromUseragent(req.headers['user-agent']);
        events.trackInternal(req, 'browser',
            browser_detect.Browser[req.session.browser]);
    }

    // Set up session state
    if(! ('proceed' in req.session)) {
        req.session.proceed = false;
    }

    next();
}

/**
 * Logic for the application's main page
 *
 * It takes care of:
 * - Getting the visitor's browser
 * - Making sure they're using the appropriate protocol (HTTP vs HTTPS)
 * - Serving the warning (if they're supposed to see it and haven't clicked through)
 * - Serving the target page otherwise
 */
export function main(req, res) {
    // Track referral code
    if('r' in req.query) {
        events.trackExternal(req, 'referral', req.query.r);
    }

    // Allow 'browser' query argument to override actual user agent
    var browser : browser_detect.Browser;
    if('browser' in req.query) {
        var browserVersion = '';
        if('browser_version' in req.query) {
            browserVersion = req.query.browser_version;
        }
        browser = browser_detect.parseBrowser(req.query.browser, browserVersion);
    } else {
        browser = req.session.browser;
    }

    // Allow 'condition' query argument to override condition setting
    var condition : conditions.Conditions;
    if('condition' in req.query) {
        condition = conditions.parseCondition(req.query.condition);
    } else {
        condition = req.session.condition;
    }

    // Depending on the user's condition, we may want to redirect them from the
    // HTTP version of the site to the HTTPS one (or vice versa).
    if(redirectBasedOnBrowser(browser, req, res)) {
        return;
    }

    if(req.session.proceed) {
        view.target(res);

        events.trackInternalMoment(req, 'show_target');
    } else {
        var domain = req.headers['host'];
        view.warning(browser, condition, domain, res);

        events.trackInternal(req, 'show_condition', conditions.asString(condition));
        events.trackInternal(req, 'show_warning', browser_detect.Browser[browser]);
    }
}

/**
 * Redirect user to HTTP or HTTPS version, depending on their browser
 *
 * Returns true if the user was redirected.
 */
function redirectBasedOnBrowser( browser : browser_detect.Browser, req, res) : boolean {
    // A supported browser is one whose warning we can emulate.
    var supportedBrowser = (browser != browser_detect.Browser.Other);

    if(req.secure && supportedBrowser) {
        // If the browser is supported, they should see an HTTP page.
        var redirectTarget = 'http://' + req.headers['host'];
        res.redirect(redirectTarget);

        events.trackInternal(req, 'redirect', redirectTarget);
        return true;
    } else if(! (req.secure || supportedBrowser)) {
        // If the browser isn't supported, they should see an HTTPS page.
        // Since it's served with a bad cert, this ensures they see an SSL
        // warning anyway.
        var redirectTarget = 'https://' + req.headers['host'];
        res.redirect(redirectTarget);

        events.trackInternal(req, 'redirect', redirectTarget);
        return true;
    }

    return false
}

/**
 * Save the user's decision to proceed
 */
export function proceed(req, res) {
    req.session.proceed = true;
    events.trackInternalMoment(req, 'proceed');
    res.send('OK');
}

/**
 * Reset application state
 */
export function reset(req, res) {
    req.session.proceed = false;
    events.trackInternalMoment(req, 'reset');
    res.send('OK');
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
