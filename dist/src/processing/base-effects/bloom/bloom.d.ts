import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions } from "../../../types";
export interface IBloom {
    /**
     * Number of downsamples used for the bloom effect. This MUST be at least 1
     * for any effect to take place.
     */
    samples: number;
    /**
     * Specify resources in this order for the effect to work:
     * [
     *   glow colors,
     *   half of glow resource (RGB),
     *   quarter of glow (RGB),
     *   eigth of glow (RGB),
     *   ...,
     *   # of steps
     * ]
     * This bloom effect down samples then up samples the results, thus the need
     * for all of the resource specifications.
     */
    resources: IRenderTextureResource[];
    /**
     * Specifies the output image the bloom effect will be composed with. If this
     * is not specified, this will not do a final composition and just leave the
     * result of the glow filter portion within the top level resource key
     * provided.
     */
    compose?: IRenderTextureResource;
    /**
     * This specifies an alternative output to target with the results. If not
     * specified the output will render to the screen.
     */
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
}
/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export declare function bloom(options: IBloom): Record<string, any>;
