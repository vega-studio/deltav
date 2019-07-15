import { Instance } from "../instance-provider";
import { IEasingControl } from "../types";
export declare type EasingUtilAllHandler<T extends Instance> = (easing: IEasingControl, instance: T, instanceIndex: number, attrIndex: number) => void;
export declare class EasingUtil {
    static all<T extends Instance>(wait: boolean, instances: T[], layerAttributes: string[], adjust?: EasingUtilAllHandler<T>): Promise<{}>;
}
