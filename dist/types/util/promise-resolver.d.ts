export interface IPromiseResolver {
    /**
     * When true, this resolver will wait for all of it's child resolvers to
     * resolve before it allows ALL child resolvers and itself to continue
     * execution. Otherwise, this resolver will allow child resolvers to continue
     * once itself has resolved.
     */
    waitsForChildren?: boolean;
}
/**
 * This is a convenience object for creating a promise and retrieving it's resolve method for
 * later use in resolving a situation. Very handy for making a method asynchronous.
 */
export declare class PromiseResolver<T> {
    private resolver;
    private rejector;
    promise: Promise<T>;
    /**
     * This resolver can supersede other resolvers and hijack their ability to
     * resolve until this resolver resolves. There is also the ability to make
     * this resolver wait for all the child resolvers to wait before any of the
     * resolvers can continue. These children represent the resolvers this
     * resolver hijacked.
     */
    children?: PromiseResolver<any>[];
    /** Stores the resolution values of each child that gets resolved */
    private childResolutions?;
    private childResolvers?;
    constructor(_options?: IPromiseResolver);
    resolve(val: T): void;
    reject<U>(reason: U): void;
    /**
     * This causes this resolver to steal the child resolver's resolve method and
     * force the child to wait for this resolver to complete. This is similar to a
     * cancellation pattern EXCEPT it instead continues execution for all
     * processes waiting for a common task resolution.
     */
    hijack(child: PromiseResolver<any>): void;
}
