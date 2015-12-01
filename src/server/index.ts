/// <reference path='../../typings/vendor/body-parser/body-parser.d.ts' />
/// <reference path='../../typings/vendor/express/express.d.ts' />
/// <reference path='../../typings/vendor/morgan/morgan.d.ts' />
/// <reference path='../../typings/vendor/node/node.d.ts' />
/// <reference path='../../typings/local/cookie-session.d.ts' />
/// <reference path='../../typings/local/useragent.d.ts' />

'use strict';

import bodyParser = require('body-parser');
import cookieSession = require('cookie-session');
import crypto = require('crypto');
import express = require('express');
import fs = require('fs');
import morgan = require('morgan');
import path = require('path');
import useragent = require('useragent');

import browser_detect = require('./browser');

enum Conditions { Control, Social };
enum EventSource { External, Internal };


/**
 * Render a warning page based on the given browser
 */
function renderResponseForBrowser(browser : browser_detect.Browser, req : express.Request, res : express.Response) : void {
    var view = path.join('warnings', browser_detect.filenameForBrowser(browser));
    res.render(view, {
        condition: req.session.condition,
        domain: req.headers['host']
    });
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

// Parse JSON requests
app.use(bodyParser.json());

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
    var browser : browser_detect.Browser;

    // Decide which browser warning to serve
    if('browser' in req.query) {
        // Allow 'browser' query argument to override actual user agent
        browser = browser_detect.parseBrowser(req.query.browser);
    } else {
        var agent = useragent.lookup(req.headers['user-agent']);
        browser = browser_detect.parseBrowser(agent.family);
    }

    track(req, 'browser', browser_detect.Browser[browser]);

    renderResponseForBrowser(browser, req, res);
});

// Show the "unsafe" page
app.get('/proceed', function(req, res) {
    track(req, 'proceed', (new Date()).toISOString());
    res.render('unsafe');
});

app.post('/event', function(req, res) {
    var name = req.body.name;
    var value = req.body.value;
    // TODO: external event whitelist?

    recordEvent(req, EventSource.External, name, value);

    res.send('OK');
});

app.use(express.static(__dirname + '/../static'));
app.listen(8080);
