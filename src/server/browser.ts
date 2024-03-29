/// <reference path='../../typings/local/useragent.d.ts' />

import useragent = require('useragent');

export enum Browser { Chrome, Edge, Firefox, FirefoxNew, InternetExplorer, Other};
type Filename = string;

/**
 * Parse string browser names into the concrete Browser type
 *
 * The source browser names used are the "family" values from the useragent
 * library.
 */
export function parseBrowser(browser : string, version : string) : Browser {
    switch(browser) {
        case 'Chrome':
            return Browser.Chrome;
        case 'Edge':
            return Browser.Edge;
        case 'Firefox':
            if(parseInt(version) >= 44) {
                return Browser.FirefoxNew;
            } else {
                return Browser.Firefox;
            }
        case 'IE': // TODO: is this is the proper string for IE?
            return Browser.InternetExplorer;
        default:
            return Browser.Other;
    }
}

/**
 * Provide the filename of the warning for the given browser
 */
export function filenameForBrowser(browser : Browser) : Filename {
    var filename: Filename;
    switch(browser) {
        case Browser.Chrome:
           return 'chrome';
        case Browser.Edge:
           return 'edge';
        case Browser.Firefox:
           return 'firefox';
        case Browser.FirefoxNew:
           return 'firefox_new';
        case Browser.InternetExplorer:
           return 'ie';
        case Browser.Other:
           return 'other';
    }
}

/**
 * Given a useragent string, returns the corresponding Browser type
 */
export function browserFromUseragent(rawUseragent : string) : Browser {
    var detectedUseragent = useragent.lookup(rawUseragent);
    return parseBrowser(detectedUseragent.family, detectedUseragent.major);
}
