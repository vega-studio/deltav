import { InstanceIOValue } from "../types";
import { Vec } from "./vector";
export declare enum AutoEasingLoopStyle {
    /** Time will go from 0 -> 1 then stop at 1 */
    NONE = 1,
    /** Time will go from 0 -> infinity */
    CONTINUOUS = 4,
    /** Time will continuously go 0 -> 1 then 0 -> 1 then 0 -> 1 etc etc */
    REPEAT = 2,
    /** Time will continously go 0 -> 1 then 1 -> 0 then 0 -> 1 then 1 -> 0 etc etc */
    REFLECT = 3
}
/**
 * This defines a GPU enabled easing method that will be executed on the GPU to maneuver
 *
 */
export interface IAutoEasingMethod<T extends InstanceIOValue> {
    /** An easing method that should produce IDENTICAL values to the values of the gpu easing method using the exact same parameters */
    cpu(start: T, end: T, t: number, out?: T): T;
    /** This adds a delay to the starting time of an easing change */
    delay: number;
    /** This is how long the easing method should last */
    duration: number;
    /**
     * An easing method written in shader language that should produce IDENTICAL
     * values to the values of the cpu easing method using the exact same parameters.
     */
    gpu: string;
    /**
     * This defines the looping style of the easing.
     */
    loop: AutoEasingLoopStyle;
    /**
     * This shall be the name of the easing method as it appears in the spu shader.
     * BE WARNED: This name is used to dedup the methods created on the shader. So,
     * if you use the same name as another ease method used on a single layer, you run
     * the risk of one overriding the other with an undefined chance of who wins.
     */
    methodName: string;
    /**
     * A unique identifier for the auto easing method.
     */
    uid: number;
    /**
     * This lets you modify some auto easing validation rules.
     */
    validation?: {
        ignoreEndValueCheck?: boolean;
        ignoreOverTimeCheck?: boolean;
    };
}
/**
 * Class of base AutoEasingMethods as well as helper constructs for making the methods.
 */
export declare class AutoEasingMethod<T extends InstanceIOValue> implements IAutoEasingMethod<T> {
    /**
     * Autoeasing methods for linear easing
     */
    static immediate<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Autoeasing methods for linear easing
     */
    static linear<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for Accelerating to end
     */
    static easeInQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for decelerating to end
     */
    static easeOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for Accelerate to mid, then decelerate to end
     */
    static easeInOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for Slower acceleration
     */
    static easeInCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for Slower deceleration
     */
    static easeOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for Slower acceleration to mid, and slower deceleration to end
     */
    static easeInOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for even Slower acceleration to end
     */
    static easeInQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for even Slower deceleration to end
     */
    static easeOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
     */
    static easeInOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for super slow accelerating to the end
     */
    static easeInQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for super slow decelerating to the end
     */
    static easeOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for super slow accelerating to mid and super slow decelerating to the end
     */
    static easeInOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for elastic effect
     */
    static easeOutElastic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for retracting first then shooting to the end
     */
    static easeBackIn<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for overshooting at the end
     */
    static easeBackOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * Auto easing for overshooting at the end
     */
    static easeBackInOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /**
     * This is an easing method that performs a sinusoidal wave where the amplitude is
     * (start - end) * 2 and the wave starts at the start value.
     *
     * This is intended to work best with the CONTINUOUS loop style.
     */
    static continuousSinusoidal<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatLinear<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatInOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatOutElastic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatBackIn<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatBackOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static slerpQuatBackInOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    /** A uid for the easing method */
    uid: number;
    /** The easing method for the cpu */
    cpu: IAutoEasingMethod<T>["cpu"];
    /** Time before a delay  */
    delay: number;
    /** The time in ms is takes to complete the animation */
    duration: number;
    /** The easing method on the GPU */
    gpu: IAutoEasingMethod<T>["gpu"];
    /** The looping style of the animation */
    loop: AutoEasingLoopStyle;
    /** Method name of the ease function on the gpu */
    methodName: string;
    constructor(cpu: IAutoEasingMethod<T>["cpu"], gpu: IAutoEasingMethod<T>["gpu"], duration?: number, method?: string);
}
