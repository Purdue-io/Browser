export class Page {
    public static create(urlPathSegment: string): Page {
        // Until abstract static methods are supported, we have to throw
        // a runtime error.
        throw Error("Base page class should not be instantiated.");
    }
}