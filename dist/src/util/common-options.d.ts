import { ILayerMaterialOptions } from "../types";
/**
 * These are material options you may commonly see for handling various scenarios.
 */
export declare class CommonMaterialOptions {
    /**
     * Sets up blending for transparent shapes.
     * Removes need for gl_FragColor.rgb *= gl_FragColor.a in shader.
     */
    static transparentShapeBlending: ILayerMaterialOptions;
    /**
     * Sets up blending for transparent images. This requires the image to be premultipled alpha.
     * Removes need for texel.rgb *= texel.a; as it assumes the value is premultiplied.
     */
    static transparentImageBlending: ILayerMaterialOptions;
}
