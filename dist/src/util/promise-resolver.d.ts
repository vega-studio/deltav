/**
 * This is a convenience object for creating a promise and retrieving it's resolve method for
 * later use in resolving a situation. Very handy for making a method asynchronous.
 */
export declare class PromiseResolver<T> {
    resolver: (val: T | undefined) => void;
    rejector: Function;
    promise: Promise<T>;
    constructor();
    resolve(val?: T): void;
    reject<U>(reason: U): void;
}
