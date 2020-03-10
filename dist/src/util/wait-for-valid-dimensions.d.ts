/**
 * This produces a method that is a gate for methods that may be entered multiple times before a valid dimension occurs.
 * This allows you to reduce the number of times the method is allowed to actually execute (reduced to a single
 * execution) once the dimensions are valid.
 *
 * For example, if we have an init() method that keeps getting called until object is properly initialized, but the
 * object is waiting for valid dimensions from it's container then you can get this pattern to happen:
 *
 * obj.init(); // no valid dimensions
 * obj.init(); // no valid dimensions
 * // dimensions are now valid!
 * obj.init(); // Initializes properly!
 *
 * You will notice an inherent problem or challenge. obj.init() probably contains code that shouldn't execute unless
 * the dimensions are available. Additionally you may see this happen:
 *
 * obj.init(); // no valid dimensions
 * // Nothing else happens
 * // Dimensions are now valid!
 * // obj.init isn't ever going to get called again
 *
 * So you are stuck with needing a robust initializer that can handle being called multiple times, only execute once,
 * and can wait for the dimensions to occur. It's also assumed the most recent init() call should be the one true
 * method call.
 *
 * So we have this method which allows you to make such a robust method:
 *
 * class Obj {
 *   waitToInit = waitForValidDimensions(container);
 *
 *   async init() {
 *     const result = this.waitToInit();
 *     if (!result) return;
 *     // Do your init
 *   }
 * }
 *
 * Now init methods will stack up waiting for the valid dimensions, but upon valid dimensions being available, all the
 * methods will resolve but only the latest init will actually execute as it will be the only one provided a 'true'
 * result.
 */
export declare function waitForValidDimensions(container?: HTMLElement): Function & {
    cancel: Function;
};
