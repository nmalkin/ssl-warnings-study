/// <reference path='..//vendor/express/express.d.ts' />

declare module Express {
    export interface Request {
        session: any;
    }
}

declare function CookieSession(args : any) : any;
declare module 'cookie-session' {
    import express = require('express');
    export = CookieSession;
}
