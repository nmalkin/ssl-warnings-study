import path = require('path');

import browser_detect = require('./browser');

/**
 * Render a warning page based on the given browser
 */
export function renderResponseForBrowser(browser : browser_detect.Browser, req, res) : void {
    // Unsupported browsers go straight to the unsafe page
    // (but it will be served over self-signed HTTPS)
    if(browser === browser_detect.Browser.Other) {
        res.redirect('/proceed');
        return;
    }

    var view = path.join('warnings', browser_detect.filenameForBrowser(browser));
    res.render(view, {
        condition: req.session.condition,
        domain: req.headers['host']
    });
}
