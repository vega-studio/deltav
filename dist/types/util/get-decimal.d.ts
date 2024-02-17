/**
 * Simple function for getting a number up to a certain decimal. This properly
 * returns a number to work with. This is for special formatting and should not
 * be used for mathematical operations.
 *
 * This specifically rounds up the final decimal value.
 */
export declare function getDecimal(value: number | string, decimalPlaces: number): number;
