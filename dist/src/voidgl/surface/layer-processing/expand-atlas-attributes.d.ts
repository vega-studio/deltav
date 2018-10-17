import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IUniform } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare function generateAtlasResourceUniforms<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[]): IUniform[];
