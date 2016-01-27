export enum Conditions { Control, Social, Expertise, PositiveFrame, NegativeFrame, Statistics, Difficulty };
var conditionCount : number = 7;

/**
 * Return a random condition
 */
function randomCondition() : Conditions {
    return Math.floor(Math.random() * conditionCount);
}

export function assignNext() : Conditions {
    return randomCondition();
}

export function asString(condition : Conditions) : string {
    return Conditions[condition];
}

export function parseCondition(condition : string) : Conditions {
    return Conditions[condition] || Conditions.Control;
}
