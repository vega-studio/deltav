import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { ImageInstance } from "./image-instance";
export interface IImageRenderLayerProps<T extends ImageInstance> extends ILayer2DProps<T> {
    /** The id of the atlas to load resources into */
    atlas?: string;
    /** The properties we wish to animate for the image */
    animate?: {
        tint?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
    };
    /**
     * This is the scale resources for the images will be loaded into the atlas. A value of
     * 0.5 will cause images to load at 50% their source size to the atlas.
     */
    rasterizationScale?: number;
}
/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class ImageRenderLayer<T extends ImageInstance, U extends IImageRenderLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IImageRenderLayerProps<any>;
    /** Easy lookup of attribute names to aid in modifications to be applied to elements */
    static attributeNames: {
        location: string;
        anchor: string;
        size: string;
        depth: string;
        scaling: string;
        texture: string;
        tint: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<ImageInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
