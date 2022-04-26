import { Instance } from "../../instance-provider";
import { IRenderTextureResource } from "../../resources";
import { IRenderTextureResourceRequest } from "../../resources/texture/render-texture-resource-request";
import { ILayerProps, Layer } from "../../surface";
import { Color, IShaderInitialization, IUniform } from "../../types";
declare class PostProcessInstance extends Instance {
    tint: Color;
    request: IRenderTextureResourceRequest;
    constructor();
}
export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
    /** List of resource names and their respective keys to apply  */
    buffers: Record<string, IRenderTextureResource | undefined>;
    /**
     * This is the fragment shader that will handle the operation to perform
     * computations against all of the input shaders.
     */
    fs: string;
    /**
     * Additional uniforms to inject into the program.
     */
    uniforms?: IUniform[];
}
/**
 * This layer takes in several resources and sets up an appropriate geometry and
 * shader IO to allow for an aggregation shader to be specified.
 */
export declare class PostProcessLayer extends Layer<PostProcessInstance, IPostProcessLayer> {
    static defaultProps: IPostProcessLayer;
    initShader(): IShaderInitialization<PostProcessInstance>;
    getMaterialOptions(): import("../../util").CommonMaterial;
}
export {};
