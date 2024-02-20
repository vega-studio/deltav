/**
 * This forces a flow to completion with the final yield value returned.
 */
export declare function rush<T>(generator: Iterable<T>): Promise<any>;
