export enum Conditions { Control, Social };

export function assignNext() : Conditions {
    // Randomly choose between conditions
    var random : number = Math.floor(Math.random() * 2);

    if(random == 0) {
        return Conditions.Control;
    } else {
        return Conditions.Social;
    }
}

export function asString(condition : Conditions) : string {
    return Conditions[condition];
}

export function parseCondition(condition : string) : Conditions {
    switch(condition) {
        case 'social':
            return Conditions.Social;
        default:
            return Conditions.Control;
    }
}
