import { Instance } from "../instance-provider/instance.js";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface/layer.js";
/**
 * Used for reactive layer generation and updates.
 */
export declare function createLayer<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>>(layerClass: ILayerConstructable<TInstance, TLayerProps> & {
    defaultProps: TLayerProps;
}, props: Omit<TLayerProps, "key" | "data"> & Partial<Pick<TLayerProps, "key" | "data">>): LayerInitializer<TInstance, TLayerProps>;
/**
 * Helps construct child layers that are compatible with the child layering
 * system.
 */
export declare function createChildLayer<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>>(layerClass: ILayerConstructable<TInstance, TLayerProps> & {
    defaultProps: TLayerProps;
}, props: Omit<TLayerProps, "key" | "data"> & Partial<Pick<TLayerProps, "key" | "data">>): LayerInitializer<Instance, ILayerProps<Instance>>;
