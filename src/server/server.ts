/// <reference path='../../typings/vendor/body-parser/body-parser.d.ts' />
/// <reference path='../../typings/vendor/express/express.d.ts' />
/// <reference path='../../typings/vendor/morgan/morgan.d.ts' />
/// <reference path='../../typings/vendor/node/node.d.ts' />
/// <reference path='../../typings/local/cookie-session.d.ts' />
/// <reference path='../../typings/local/raven.d.ts' />

import bodyParser = require('body-parser');
import cookieSession = require('cookie-session');
import express = require('express');
import fs = require('fs');
import http = require('http');
import https = require('https');
import morgan = require('morgan');
import raven = require('raven');

import controller = require('./controller');

// Report errors to Sentry
var client = new raven.Client(process.env.SENTRY_URL);
client.patchGlobal();

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

// Set up everyone's session
app.use(controller.sessionManager);

// Use ejs for rendering templates
app.set('view engine', 'ejs');

// App routes
app.get('/', controller.main);
app.post('/proceed', controller.proceed);
app.post('/event', controller.event);
app.get('/reset', controller.reset);

// Serve static files
app.use(express.static(__dirname + '/../static'));
app.use(express.static(__dirname + '/../decoy'));

// Provide keys for HTTPS
var options = {
    key: fs.readFileSync(__dirname + '/../certs/key.pem'),
    cert: fs.readFileSync(__dirname + '/../certs/cert.pem')
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
