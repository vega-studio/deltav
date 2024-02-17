import { Color, IShaderInitialization, IUniform } from "../../../../types";
import { ILayerProps, Layer } from "../../../../surface";
import { Instance } from "../../../../instance-provider";
import { IRenderTextureResource } from "../../../../resources";
export declare class PostProcessInstance extends Instance {
    tint: Color;
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
    getMaterialOptions(): Omit<import("../../../../util").CommonMaterial, "modify>">;
}
