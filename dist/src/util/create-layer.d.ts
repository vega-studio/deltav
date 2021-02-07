import { Instance } from "../instance-provider/instance";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface/layer";
/**
 * Used for reactive layer generation and updates.
 */
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key" | "data"> & Partial<Pick<U, "key" | "data">>): LayerInitializer;
