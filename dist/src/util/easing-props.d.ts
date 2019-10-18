import { Vec } from "../math/vector";
import { IEasingProps } from "../types";
export declare class EasingProps implements IEasingProps {
    delay: number;
    duration: number;
    end: Vec;
    isManualStart: boolean;
    isTimeSet: boolean;
    start: Vec;
    startTime: number;
    constructor(options: IEasingProps);
    setAutomatic(): void;
    setStart(start?: Vec): void;
    setTiming(delay?: number, duration?: number): void;
}
