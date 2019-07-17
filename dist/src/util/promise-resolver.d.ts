export declare class PromiseResolver<T> {
    resolver: (val: T | undefined) => void;
    rejector: Function;
    promise: Promise<T>;
    constructor();
    resolve(val?: T): void;
    reject<U>(reason: U): void;
}
