/**
 * Parses the current cookies for this application into an easier to use JSON
 * object.
 *
 * If a cookie is not passed as an argument, this will parse the cookie found on
 * the document (in browser. In Node an argument is required).
 */
export declare function cookieParser(manual?: string): Record<string, string>;
