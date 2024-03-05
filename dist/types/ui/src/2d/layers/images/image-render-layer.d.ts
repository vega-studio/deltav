import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ImageInstance } from "./image-instance";
import { LayerScene, Surface } from "../../../surface";
export interface IImageRenderLayerProps<TInstance extends ImageInstance> extends ILayer2DProps<TInstance> {
    /** The id of the atlas to load resources into */
    atlas?: string;
    /** The properties we wish to animate for the image */
    animate?: {
        tint?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
        rotation?: IAutoEasingMethod<Vec>;
    };
    /**
     * This is the scale resources for the images will be loaded into the atlas. A
     * value of 0.5 will cause images to load at 50% their source size to the
     * atlas.
     */
    rasterizationScale?: number;
    /**
     * You can disallow image rotations by setting this to true. This improves
     * rendering performance for times large amounts of images need to be
     * rendered.
     *
     * WARN: ENABLED ROTATIONS CURRENTLY DISABLES SCALE MODES FOR THE IMAGE
     */
    enableRotation?: boolean;
}
/**
 * This layer displays Images and provides as many controls as possible for
 * displaying them in interesting ways.
 */
export declare class ImageRenderLayer<TInstance extends ImageInstance, TLayerProps extends IImageRenderLayerProps<TInstance>> extends Layer2D<TInstance, TLayerProps> {
    static defaultProps: IImageRenderLayerProps<any>;
    /** Easy lookup of attribute names to aid in modifications to be applied to
     * elements */
    static attributeNames: {
        location: string;
        anchor: string;
        size: string;
        depth: string;
        scaling: string;
        texture: string;
        tint: string;
        rotation: string;
    };
    constructor(surface: Surface, scene: LayerScene, props: TLayerProps);
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<TInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
