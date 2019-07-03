import { Instance } from "../instance-provider";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface";
import { Omit } from "../types";
export declare function debugLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
