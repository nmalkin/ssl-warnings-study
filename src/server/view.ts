import fs = require('fs');
import path = require('path');

import browser_detect = require('./browser');
import conditions = require('./conditions');

/**
 * Render a warning page based on the given browser
 */
export function warning(browser : browser_detect.Browser, condition : conditions.Conditions, domain : string, res) : void {
    // Unsupported browsers see the target ("unsafe") page.
    // (However, at this point, they should have been redirected to HTTPS and
    // have consequently seen a warning due to self-signed HTTPS.)
    if(browser === browser_detect.Browser.Other) {
        target(res);
        return;
    } else if(browser === browser_detect.Browser.FirefoxNew) {
        // The new Firefox error page is written in XHTML. Without the correct
        // content-type, it won't render properly.
        res.set('Content-Type', 'application/xhtml+xml');
    }

    var view = path.join('warnings', browser_detect.filenameForBrowser(browser));
    res.render(view, {
        condition: condition,
        domain: domain
    });
}

export function target(res) {
    var decoyPage = fs.readFileSync('static/target/index.html');
    res.set('Content-Type', 'text/html');
    res.send(decoyPage);
}
