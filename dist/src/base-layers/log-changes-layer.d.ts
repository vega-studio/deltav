import { Instance } from "../instance-provider";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface";
export declare function debugLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: U): LayerInitializer;
