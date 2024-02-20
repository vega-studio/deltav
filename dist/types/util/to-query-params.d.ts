export type QueryParams = Map<string, string | string[] | undefined> | Record<string, string | string[] | undefined>;
/**
 * Convert a map or an object to query params to send to the server. Provide
 * tokens to automatically replace ${tokens} in the values of params before
 * encoding occurs.
 *
 * Set repeatLists to cause
 */
export declare function toQueryParams(params?: QueryParams, tokens?: Record<string, string>, excludeEmpty?: boolean, repeatLists?: boolean): string;
/**
 * Loops through query params and modifies their values to replace any found
 * ${tokens}.
 */
export declare function tokenizeQueryParams(params?: QueryParams, tokens?: Record<string, string>): QueryParams;
