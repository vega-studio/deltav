import { Instance } from "../instance-provider/index.js";
import { IEasingControl } from "../types.js";
/** Handler type for discovered easing controls using the all() method */
export type EasingUtilAllHandler<T extends Instance> = (easing: IEasingControl, instance: T, instanceIndex: number, attrIndex: number) => void;
/**
 * This contains helper methods to make setting easing values easier to instances that are a part of animated layers
 */
export declare class EasingUtil {
    /**
     * This retrieves all easing metrics for every instance for every specified eased attribute.
     */
    static modify<T extends Instance>(instances: T[], layerAttributes: string[], adjust: EasingUtilAllHandler<T>): Promise<void>;
    /**
     * This finds all easing controls requested for all instances.
     *
     * If wait is true, then this method's returned promise will resolve AFTER the time
     * of all discovered easing objects has passed.
     */
    static all<T extends Instance>(wait: boolean, instances: T[], layerAttributes: string[], adjust?: EasingUtilAllHandler<T>): Promise<unknown>;
}
