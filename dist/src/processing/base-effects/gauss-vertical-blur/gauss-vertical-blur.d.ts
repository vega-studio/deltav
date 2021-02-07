import { IRenderTextureResource } from "../../../resources/texture/render-texture";
export interface IGaussVerticalBlur {
    /** Specifies the resource taken in that will be blurred for the output */
    input: string | IRenderTextureResource;
    /** Specifies an output resource key to send the results to */
    output?: string | IRenderTextureResource;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
}
/**
 * Performs a gaussian vertical blur on a resource and outputs to a specified
 * resource.
 */
export declare function gaussVerticalBlur(options: IGaussVerticalBlur): {
    views: {
        screen: import("../../..").ViewInitializer<import("../../..").IView2DProps>;
    };
    layers: {
        screen: import("../../..").LayerInitializer;
    };
};
