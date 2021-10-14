interface ISubscription{
    name : string;
    representation: string
}

// Is used to describe the Content of a Module
export class Subscription{
    name : string;
    representation : string; // Can vary on the likes of the Modules. For Youtube this might be a Channel ID, for Google Searches it may be a query.

    constructor({name, representation}:ISubscription) {
        this.name = name
        this.representation = representation
    }
}