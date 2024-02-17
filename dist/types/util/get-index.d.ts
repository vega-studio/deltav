/**
 * Mobx does NOT like retrieving out of bounds on an array. This is a warning
 * safe way to do the retrieval.
 */
export declare function getIndex<T>(list: T[], index: number): T | undefined;
