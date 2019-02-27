import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute } from "../../types";
export declare class EasingProcessing {
    process<T extends Instance>(instanceAttributes: IInstanceAttribute<T>[]): string;
}
