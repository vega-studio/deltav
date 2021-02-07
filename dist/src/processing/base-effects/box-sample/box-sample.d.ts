import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions } from "../../../types";
export declare enum BoxSampleDirection {
    DOWN = 0,
    UP = 1
}
export interface IBoxSample {
    /** Specifies the resource taken in that will be blurred for the output */
    input: string | IRenderTextureResource;
    /** Specifies an output resource key to send the results to */
    output?: string | IRenderTextureResource;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** Set for down or up sampling */
    direction: BoxSampleDirection;
    /** Options to send to the view */
    view?: Partial<IView2DProps>;
    /**
     * Allows you to control material options such as blend modes of the post
     * process effect.
     */
    material?: ILayerMaterialOptions;
}
/**
 * Performs downsampling or upsampling of an image by utilizing the linear
 * interpolation properties of texture samplong using the GPU.
 */
export declare function boxSample(options: IBoxSample): {
    views: {
        screen: import("../../..").ViewInitializer<IView2DProps>;
    };
    layers: {
        screen: import("../../..").LayerInitializer;
    };
};
