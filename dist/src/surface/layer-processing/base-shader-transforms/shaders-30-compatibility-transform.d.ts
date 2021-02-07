import { BaseShaderTransform } from "../../../shaders/processing/base-shader-transform";
/**
 * This transform is a last pass to resolve odds and ends differences that can
 * slip in from the way a shader is written. This will attempt it's best to
 * resolve a shader into the proper shader version that is appropriate for the
 * current hardware.
 */
export declare class Shaders30CompatibilityTransform extends BaseShaderTransform {
    /**
     * For es 3.0 shaders:
     *   - we make sure all varying is converted to outs.
     *   - texture2D sampling is now texture
     * For es 2.0 shaders:
     *   - we make sure the version header is removed
     *   - Ensure out's are changed to varying
     */
    vertex(shader: string): string;
    /**
     * For es 3.0 shaders:
     *   - we make sure all varying is converted to in's.
     *   - if gl_FragColor is present, we need to generate an out for it
     * For es 2.0 shaders:
     *   - we make sure the version header is removed
     *   - Ensure in's are changed to varying
     */
    fragment(shader: string): string;
}
