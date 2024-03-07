/**
 * This normalizes the HeadersInit type to a Record. Empty or undefined values
 * returns an empty object.
 */
export declare function headersToRecord(headersInit?: HeadersInit): Record<string, string>;
