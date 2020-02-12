import { Vec } from "../math/vector";
import { IEasingProps } from "../types";
/**
 * This object represents the data associated with easing. It provides the
 * information needed to make an easing equation execute to completion. It also
 * contains a few methods to aid in properly adjusting the easing values.
 */
export declare class EasingProps implements IEasingProps {
    delay: number;
    duration: number;
    end: Vec;
    isManualStart: boolean;
    isTimeSet: boolean;
    start: Vec;
    startTime: number;
    constructor(options: IEasingProps);
    /**
     * If you manually set values for the easing properties, then you use this to return
     * the easing object back to an automated state which is where the start value is
     * the calculated current position of the output and the delay and duration is determined
     * by the easing set to the layer's IAutomatedEasingMethod value set to the layer.
     */
    setAutomatic(): void;
    /**
     * This controls the start value of the easing. This should be used to force a starting
     * value of the animation.
     *
     * Use setAutomatic() to return to default easing behavior.
     */
    setStart(start?: Vec): void;
    /**
     * This controls of the timing of the easing equation. This should be used to adjust
     * when a value is to be adjusted
     *
     * Use setAutomatic() to return to default easing behavior.
     */
    setTiming(delay?: number, duration?: number): void;
}
