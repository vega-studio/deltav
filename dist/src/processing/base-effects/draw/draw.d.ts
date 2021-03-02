import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions } from "../../../types";
export interface IDrawOptions {
    /**
     * Specifies the resource taken in that will be blurred for the output.
     *
     * NOTE: Probably should disable mipmaps if you aren't seeing an output.
     */
    input: IRenderTextureResource;
    /** Specifies an output resource key to send the results to */
    output?: IRenderTextureResource;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** Options to send to the view */
    view?: Partial<IView2DProps>;
    /**
     * Allows you to control material options such as blend modes of the post
     * process effect.
     */
    material?: ILayerMaterialOptions;
    /** If specified, will only draw a single channel from the target */
    channel?: "r" | "g" | "b" | "a";
    /**
     * If channel AND this are set, the channel selected will be rendered in gray
     * scale
     */
    grayScale?: boolean;
}
/**
 * Simply renders in the input target resource to the screen as a full screen
 * quad.
 */
export declare function draw(options: IDrawOptions): {
    views: {
        screen: import("../../..").ViewInitializer<IView2DProps>;
    };
    layers: {
        screen: import("../../..").LayerInitializer;
    };
};
