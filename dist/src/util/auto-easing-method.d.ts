import { InstanceIOValue } from "../types";
import { Vec } from "./vector";
export declare enum AutoEasingLoopStyle {
    NONE = 1,
    CONTINUOUS = 4,
    REPEAT = 2,
    REFLECT = 3
}
export interface IAutoEasingMethod<T extends InstanceIOValue> {
    cpu(start: T, end: T, t: number): T;
    delay: number;
    duration: number;
    gpu: string;
    loop: AutoEasingLoopStyle;
    methodName: string;
    uid: number;
    validation?: {
        ignoreEndValueCheck?: boolean;
        ignoreOverTimeCheck?: boolean;
    };
}
export declare class AutoEasingMethod<T extends InstanceIOValue> implements IAutoEasingMethod<T> {
    static immediate<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static linear<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeInOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeOutElastic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeBackIn<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeBackOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static easeBackInOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    static continuousSinusoidal<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): IAutoEasingMethod<T>;
    uid: number;
    cpu: IAutoEasingMethod<T>["cpu"];
    delay: number;
    duration: number;
    gpu: IAutoEasingMethod<T>["gpu"];
    loop: AutoEasingLoopStyle;
    methodName: string;
    constructor(cpu: IAutoEasingMethod<T>["cpu"], gpu: IAutoEasingMethod<T>["gpu"], duration?: number, method?: string);
}
