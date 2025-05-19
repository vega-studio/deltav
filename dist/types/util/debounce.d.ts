/**
 * Debounce decorator for methods
 */
export declare function debounce(timeout: number | undefined, method: (...args: any[]) => any): (...args: any[]) => void;
/**
 * This allows a method only to be fired once per time interval specified. This
 * is differewnt from debounce as it will not cause the method to hang up if
 * there is a constant stream of the calls.
 *
 * If a call happens when the throttle disallows it, it will be queued to run
 * when the throttle time has refreshed. This will only queue the LATEST method
 * call to be called. And if there was a queued item the throttle timer will
 * start again.
 */
export declare function throttle<T extends (...args: any[]) => any>(interval: number | undefined, method: T): T;
/**
 * Commonly needed throttled log to help with debugging things on a tight
 * interval.
 */
export declare const throttledLog: (...args: any[]) => void;
