import { Instance } from "../instance-provider";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface";
import { Omit } from "../types";
/**
 * Can use this instead of createLayer to view changes streaming through a layer.
 */
export declare function debugLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
