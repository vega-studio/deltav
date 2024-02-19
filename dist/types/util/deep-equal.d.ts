/**
 * Compares all properties deeply between two objects for equality.
 */
export declare function deepEqual<T extends Record<keyof T, any>, U extends Record<keyof U, any>>(a: T, b: U, checked?: Set<any>): boolean;
