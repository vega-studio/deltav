/**
 * Handles setting up a window focus and blur event that detects when the user's
 * browser window with this application is available or not.
 *
 * Returns a disposer method to deregister the event
 */
export declare function windowFocusEvents(onFocus: (...args: any[]) => void, onBlur: (...args: any[]) => void): () => void;
