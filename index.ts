/// <reference path='typings/vendor/express/express.d.ts' />
/// <reference path='typings/vendor/morgan/morgan.d.ts' />
/// <reference path='typings/vendor/node/node.d.ts' />
/// <reference path='typings/local/cookie-session.d.ts' />
/// <reference path='typings/local/useragent.d.ts' />

'use strict';

import cookieSession = require('cookie-session');
import crypto = require('crypto');
import express = require('express');
import fs = require('fs');
import morgan = require('morgan');
import path = require('path');
import useragent = require('useragent');

enum Browser { Chrome, Edge, Firefox, InternetExplorer, Other};
enum Conditions { Control, Social };
enum EventSource { External, Internal };
type Filename = string;

/**
 * Parse string browser names into the concrete Browser type
 *
 * The source browser names used are the "family" values from the useragent
 * library.
 */
function parseBrowser(browser : string) : Browser {
    switch(browser) {
        case 'Chrome':
            return Browser.Chrome;
        case 'Edge':
            return Browser.Edge;
        case 'Firefox':
            return Browser.Firefox;
        case 'IE': // TODO: is this is the proper string for IE?
            return Browser.InternetExplorer;
        default:
            return Browser.Other;
    }
}

/**
 * Provide the filename of the warning for the given browser
 */
function filenameForBrowser(browser : Browser) : Filename {
    var filename: Filename;
    switch(browser) {
        case Browser.Chrome:
           return 'chrome';
        case Browser.Edge:
           return 'edge';
        case Browser.Firefox:
           return 'firefox';
        case Browser.InternetExplorer:
           return 'ie';
        case Browser.Other:
           return 'other';
    }
}

/**
 * Render a warning page based on the given browser
 */
function renderResponseForBrowser(browser : Browser, req : express.Request, res : express.Response) : void {
    var view = path.join('warnings', filenameForBrowser(browser));
    res.render(view, {
        condition: req.session.condition,
        domain: req.headers['host']
    });
}

function recordEvent(req, source : EventSource, event : string, value : string) : void {
    var record = {
        event: event,
        ip: req.ip,
        session: req.session.id,
        source: EventSource[source],
        timestamp: (new Date()).toISOString(),
        useragent: req.headers['user-agent'],
        value: value,
    }
    console.log(record);
}

function track(req, event : string, value : string) : void {
    recordEvent(req, EventSource.Internal, event, value);
}

// Initiate the Express app
var app = express();

// Log requests to the console
app.use(morgan('combined'));

// Create a cookie-based session
app.use(cookieSession({
    name: 'session',
    secret: process.env.SECRET || 'CHANGEIT'
}));

// Make sure every user has a session token
app.use(function(req : Express.Request, res, next) {
    if(! req.session.id) {
        req.session.id = crypto.randomBytes(64).toString('hex');
    }

    if(! req.session.condition) {
        req.session.condition = Conditions.Social;
        track(req, 'condition', Conditions[req.session.condition]);
    }

    next();
});

app.set('view engine', 'ejs');

// Show the warning
app.get('/', function(req, res) {
    var browser : Browser;

    // Decide which browser warning to serve
    if('browser' in req.query) {
        // Allow 'browser' query argument to override actual user agent
        browser = parseBrowser(req.query.browser);
    } else {
        var agent = useragent.lookup(req.headers['user-agent']);
        browser = parseBrowser(agent.family);
    }

    track(req, 'browser', Browser[browser]);

    renderResponseForBrowser(browser, req, res);
});

// Show the "unsafe" page
app.get('/proceed', function(req, res) {
    track(req, 'proceed', Date.now().toString());
    res.render('unsafe');
});

app.use(express.static(__dirname + '/static'));
app.listen(8080);
