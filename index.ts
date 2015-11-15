/// <reference path='typings/vendor/node/node.d.ts' />
/// <reference path='typings/vendor/express/express.d.ts' />
/// <reference path='typings/local/useragent.d.ts' />

var express = require('express');
var fs = require('fs');
var useragent = require('useragent');

enum Browser { Chrome, Edge, Firefox, InternetExplorer, Other};
type Filename = string;

function parseBrowser(browser : string) : Browser {
    switch(browser) {
        // TODO: what do Edge, IE look like?
        case 'Chrome':
            return Browser.Chrome;
        case 'Firefox':
            return Browser.Firefox;
        default:
            return Browser.Other;
    }
}

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

function getWarningPage(browserFile : Filename) : string {
    if(browserFile === null) {
        return '';
    }

    var filePath = 'views/warnings/' + browserFile;
    return fs.readFileSync(filePath);
}

var app = express();
app.get('/', function(req, res) {
    var browser : Browser;

    if('browser' in req.query) {
        browser = parseBrowser(req.query.browser);
    } else {
        var agent = useragent.lookup(req.headers['user-agent']);
        browser = parseBrowser(agent.family);
    }

    var filename = filenameForBrowser(browser);
    var page = getWarningPage(filename);

    res.set('Content-Type', 'text/html');
    res.send(page);
});

app.listen(3000);
