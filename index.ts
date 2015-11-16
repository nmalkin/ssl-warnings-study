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
import useragent = require('useragent');

enum Browser { Chrome, Edge, Firefox, InternetExplorer, Other};
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
           return 'chrome.html';
        case Browser.Edge:
           return 'edge.html';
        case Browser.Firefox:
           return 'firefox.html';
        case Browser.InternetExplorer:
           return 'ie.html';
        case Browser.Other:
           return null;
    }
}

/**
 * Return the contents of the warning page with the given filename
 *
 * If the argument is null, an empty string is returned instead.
 */
function getWarningPage(browserFile : Filename) : string {
    if(browserFile === null) {
        return '';
    }

    var filePath = 'views/warnings/' + browserFile;
    return fs.readFileSync(filePath).toString();
}

function renderResponseForBrowser(browser : Browser, res : express.Response) {
    // Load warning page and send it to the user
    var filename = filenameForBrowser(browser);
    var page = getWarningPage(filename);
    res.set('Content-Type', 'text/html');
    res.send(page);
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

    next();
});

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

    renderResponseForBrowser(browser, res);
});

app.use(express.static(__dirname + '/static'));
app.listen(8080);
