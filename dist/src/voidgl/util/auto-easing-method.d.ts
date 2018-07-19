import { InstanceIOValue } from "../types";
import { Vec } from "./vector";
export declare enum AutoEasingLoopStyle {
    NONE = 1,
    REPEAT = 2,
    REFLECT = 3,
}
export interface IAutoEasingMethod<T extends InstanceIOValue> {
    cpu(start: T, end: T, t: number): T;
    delay: number;
    duration: number;
    gpu: string;
    loop: AutoEasingLoopStyle;
    methodName: string;
}
export declare class AutoEasingMethod<T extends InstanceIOValue> implements IAutoEasingMethod<T> {
    static immediate<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (_start: T, end: T, _t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static linear<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInOutQuad<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInOutCubic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInOutQuart<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeInOutQuint<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeOutElastic<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeBackIn<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeBackOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    static easeBackInOut<T extends Vec>(duration: number, delay?: number, loop?: AutoEasingLoopStyle): {
        cpu: (start: T, end: T, t: number) => T;
        delay: number;
        duration: number;
        gpu: string;
        loop: AutoEasingLoopStyle;
        methodName: string;
    };
    cpu: IAutoEasingMethod<T>["cpu"];
    delay: number;
    duration: number;
    gpu: IAutoEasingMethod<T>["gpu"];
    loop: AutoEasingLoopStyle;
    methodName: string;
    constructor(cpu: IAutoEasingMethod<T>["cpu"], gpu: IAutoEasingMethod<T>["gpu"], duration?: number, method?: string);
}
