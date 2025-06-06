import { Instance } from "./instance.js";
/**
 * This is an instance that is basically an instance stub that won't throw any implementation
 * errors when used, but will effectively do nothing.
 */
export declare class BasicInstance extends Instance {
    resourceTrigger(): void;
}
