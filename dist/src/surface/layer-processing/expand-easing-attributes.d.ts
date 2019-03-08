import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare function generateEasingAttributes<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[]): void;
