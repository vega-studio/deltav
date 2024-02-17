/**
 * This static class provides a utility for creating an array buffer and mapping
 * it's values to an initial value or simply create an initial array that is
 * iterable.
 *
 * Purpose: This utility was created to get around issues with default JS means
 * of generating arrays. All of the "native" means are incredibly slow and have
 * issues with creating double instances of arrays or doing multiple iterations
 * across the size of the array.
 *
 * This ensures a single allocation and a single iteration of the array which is
 * optimal. Currently, these methods beat the normal native means significantly.
 */
export declare class MakeBuffer {
    /**
     * Create and fill a buffer with intiial values.
     */
    static map<T>(size: number, map: (index: number) => T): T[];
    /**
     * Create a buffer with initial values applied.
     */
    static init<T>(size: number, initialValue: T): T[];
    /**
     * Creates a buffer that begins at the provided value and ends exclusive of
     * the end value. You can provide a step value to increase the buffer by.
     */
    static range(start: number, end: number, step?: number): number[];
}
