/**
 * THIS IS A DEBUGGING UTILITY AND SHOULD NOT BE IMPORTED IN ANY WAY FOR A PRODUCTION BUILD
 *
 * This is a helper method for logging on the frame loop. It will take in logs that are intended to be output but will
 * display them at a reduced frequency to eliminate flicker from the log console.
 */
export declare function consoleRender(logMethod: Function, refresh?: number): ((...args: any[]) => void) & {
    start: () => void;
    stop: () => void;
};
