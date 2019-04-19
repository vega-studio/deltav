import { LayerSurface } from "../surface";
import { IAutoEasingMethod } from "./auto-easing-method";
import { Vec } from "./vector";
export declare type AnimationDelayAccessor = (groupIndex: number, currentDelay: number) => number;
export declare type AnimationInstanceModificationCallback = (groupIndex: number) => void;
export declare class AnimationHelper {
    surface: LayerSurface;
    constructor(surface: LayerSurface);
    groupAnimation(easingMethod: IAutoEasingMethod<Vec>, groupCount: number, baseDelay: number, delayGap: number | AnimationDelayAccessor, modifyInstances: AnimationInstanceModificationCallback): void;
}
