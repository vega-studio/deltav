import React from "react";
import { Instance, InstanceProvider } from "../../../instance-provider/index.js";
import { IRenderTextureResource } from "../../../resources/index.js";
import { ILayerConstructable, ILayerProps } from "../../../surface/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { ILayerBaseJSX } from "./as-layer.js";
export type LayerConfig<TInstance extends Instance, TProps extends ILayerProps<TInstance>> = Omit<TProps, "key" | "data"> & Partial<Pick<TProps, "key" | "data">>;
export interface ILayerJSX<TInstance extends Instance, TProps extends ILayerProps<TInstance>, TUse extends IRenderTextureResource = IRenderTextureResource> extends Partial<ILayerBaseJSX<TInstance, TProps>> {
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name?: string;
    /** The Layer constructor type we wish to initialize */
    type: ILayerConstructable<TInstance, TProps> & {
        defaultProps: TProps;
    };
    /** Configure the constructed layer via the layer's props */
    config: LayerConfig<TInstance, TProps>;
    /**
     * This provides a means to access the instance provider used by this Layer.
     * When a layer is not explicitly provided an instance provider, it will
     * generate one for itself.
     *
     * This ALSO is a means to deliver a provider to the layer! If the ref has a
     * provider populated within it, the Layer will use that provider instead of
     * generating one. Delivering the provider via the ref is the same as setting
     * the Layers config.data property.
     */
    providerRef?: React.MutableRefObject<InstanceProvider<TInstance> | null>;
    /**
     * This allows resource dependencies to be specified for the Layer that will
     * be necessary to apply to the Layer configuration. This is commonly used
     * when the layer has a texture input. You specify the
     */
    uses?: {
        /** Resource names to use */
        names: string[];
        apply: (resources: Record<string, TUse>, config: LayerConfig<TInstance, TProps>) => LayerConfig<TInstance, TProps>;
    };
}
export declare const LayerJSX: {
    <TInstance extends Instance = Instance, TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>>(props: ILayerJSX<TInstance, TProps>): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
