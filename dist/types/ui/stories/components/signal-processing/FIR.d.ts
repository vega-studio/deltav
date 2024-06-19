import type { Vec2 } from "../../../src";
/**
 * Performs a frequency filtration across a provided streamed in signal.
 * This filter can be adjusted via the seed values provided.
 */
export declare class FIRFilter {
    coefficients: number[];
    filter: number[];
    /**
     * The seed values work in tuples [FIR filter coefficient, starting bias];
     * When normalize is activated, the seed values are normalized to the provided value.
     * When normalize is a value of 1, this behaves like a low pass FIR filter.
     */
    constructor(seedValues: Vec2[], normalize?: number);
    /**
     * Reset the filter to have all of it's filter values set to the provided value
     */
    reset(value: number): void;
    /**
     * This streams in a value into the filter and outputs the next computed value
     */
    stream(value: number): number;
    /**
     * Runs a list of values through the filter and returns an array of each step
     */
    run(start: number, values: number[]): number[];
}
