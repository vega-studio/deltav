export type Lookup<T> = {
    [key: string]: T | Lookup<T>;
};
/**
 * This gets all of the values of a Lookup. Requires a typeguard to ensure output
 * matches the proper return type.
 */
export declare function mapLookupValues<T extends object, U>(label: string, check: (value: T | Lookup<T>) => boolean, lookup: Lookup<T>, callback: (key: string, value: T) => U): U[];
