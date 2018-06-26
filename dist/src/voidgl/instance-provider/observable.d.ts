import { Instance } from '../util/instance';
/**
 * This is a custom decorator intended for single properties on Instances only! It will
 * facilitate automatic updates and stream the updates through an InstanceProvider to properly
 * update the Instances values in the appropriate and corresponding buffers that will get committed
 * to the GPU.
 */
export declare function observable(target: Instance, key: string): void;
