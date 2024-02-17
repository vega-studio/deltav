import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface";
import { Instance } from "../instance-provider";
import { Omit } from "../types";
/**
 * Can use this instead of createLayer to view changes streaming through a layer.
 */
export declare function debugLayer<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(layerClass: ILayerConstructable<TInstance, TProps> & {
    defaultProps: TProps;
}, props: Omit<TProps, "key" | "data"> & Partial<Pick<TProps, "key" | "data">>): LayerInitializer<Instance, ILayerProps<Instance>>;
