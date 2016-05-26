interface Agent {
    family: string;
    major: string;
    minor: string;
    patch: string;
    //{"family":"Firefox","major":"45","minor":"0","patch":"0","device":{"family":"Other","major":"0","minor":"0","patch":"0"},"os":{"family":"Mac OS X","major":"10","minor":"10","patch":"0"}
}

declare module UserAgent {
    function lookup(useragent: string) : Agent;
}

declare module 'useragent' {
    export = UserAgent;
}
