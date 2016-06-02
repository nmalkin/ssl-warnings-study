// from: https://gist.github.com/PaulBGD/ac839cc1f7115d749b95

declare module "raven" {

    export interface RavenClient {
        patchGlobal():void;
        captureMessage(message:any):void;
        captureMessage(message:any, args:MessageArguments):void;
        captureMessage(message:any, callback:(result:Result) => void):void;
        captureMessage(message:any, args:MessageArguments, callback:(result:Result) => void):void;
        captureError(message:any):void;
        captureError(message:any, args:MessageArguments):void;
        captureError(message:any, callback:(result:Result) => void):void;
        captureError(message:any, args:MessageArguments, callback:(result:Result) => void):void;
    }

    export var Client: {
        new (url:string): RavenClient;
    };

    export interface MessageArguments {
        extra: any;
        tags: any;
        fingerprint: any[];
        level: string;
    }

    export interface Result {
        id: string;
    }
}
