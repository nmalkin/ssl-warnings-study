import path = require('path');

import browser_detect = require('./browser');

/**
 * Render a warning page based on the given browser
 */
export function warning(browser : browser_detect.Browser, req, res) : void {
    // Unsupported browsers see the target ("unsafe") page.
    // (However, at this point, they should have been redirected to HTTPS and
    // have consequently seen a warning due to self-signed HTTPS.)
    if(browser === browser_detect.Browser.Other) {
        target(res);
        return;
    }

    var view = path.join('warnings', browser_detect.filenameForBrowser(browser));
    res.render(view, {
        condition: req.session.condition,
        domain: req.headers['host']
    });
}

export function target(res) {
    res.render('target');
}
