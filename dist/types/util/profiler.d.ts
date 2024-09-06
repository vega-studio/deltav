/**
 * This begins recording how much time it will take.
 */
export declare function startProfile(id: string): void;
/**
 * This stops the timer and adds the discovered time to the current id.
 */
export declare function endProfile(id: string): void;
/**
 * This flushes and prints the profile to the console and resets the total
 * recorded time for the id.
 */
export declare function flushProfile(id?: string): void;
