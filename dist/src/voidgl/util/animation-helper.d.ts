import { LayerSurface } from '../surface';
import { IAutoEasingMethod } from './auto-easing-method';
import { Vec } from './vector';
export declare type AnimationDelayAccessor = (groupIndex: number, currentDelay: number) => number;
export declare type AnimationInstanceModificationCallback = (groupIndex: number) => void;
/**
 * This provides some methods that aids in more complicated animation tasks, such as
 * adjusting gpu animated properties with differing time delay values for each change.
 */
export declare class AnimationHelper {
    surface: LayerSurface;
    constructor(surface: LayerSurface);
    /**
     * When you want to animate properties of instances but you want them to start at differing times,
     * use this method to ensure the timings starting between the elements is correct.
     *
     * @param easingMethod This is the easing method used for the layer's property to animate
     * @param groupCount This is the number of animations desired for a given delay level
     * @param delayGap This is the amount of delay between each group. This can be a static value or
     *                 can be a dynamic callback
     */
    groupAnimation(easingMethod: IAutoEasingMethod<Vec>, groupCount: number, baseDelay: number, delayGap: number | AnimationDelayAccessor, modifyInstances: AnimationInstanceModificationCallback): void;
}
