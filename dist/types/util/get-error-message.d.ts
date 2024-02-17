/**
 * Errors can not have a type specified in the try catch clause. This makes
 * outputting an error message safe and easier to type by doing validations
 * necessary to get a standard error's error message or stack.
 */
export declare function getErrorMessage(e: unknown): string;
