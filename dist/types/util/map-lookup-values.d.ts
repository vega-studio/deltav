/**
 * A special type that allows deep nesting of identifiers before ultimately
 * landing on a specific type at the leaves of the object.
 */
export type Lookup<T> = {
    [key: string]: T | Lookup<T>;
};
/**
 * A very tricky method that maps a Lookup (dictionary with nested keys) to
 * values found in the leaves of the tree of the object.
 */
export declare function mapLookupValues<T extends object, U>(label: string, check: (value: T | Lookup<T>) => boolean, lookup: Lookup<T>, callback: (key: string, value: T) => U): U[];
