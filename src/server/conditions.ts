enum Conditions { Control, Social };

export function assignNext() : Conditions {
    // Right now, everyone gets assigned to the social condition.
    return Conditions.Social;
}

export function asString(condition : Conditions) : string {
    return Conditions[condition];
}
