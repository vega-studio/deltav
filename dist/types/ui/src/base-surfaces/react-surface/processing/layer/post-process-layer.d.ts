import { Instance } from "../../../../instance-provider";
import { IRenderTextureResource } from "../../../../resources";
import { ILayerProps, Layer } from "../../../../surface";
import { Color, IShaderInitialization, IUniform } from "../../../../types.js";
export declare class PostProcessInstance extends Instance {
    tint: Color;
    constructor();
}
export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
    /**
     * The name of the texture coordinate variable used in the shader.
     */
    textureCoordinateName?: string;
    /**
     * List of resource names and their respective keys to apply. Use an array of
     * resources if you want that resource to be swapped every render.
     */
    buffers: Record<string, IRenderTextureResource | IRenderTextureResource[] | undefined>;
    /**
     * This is the fragment shader that will handle the operation to perform
     * computations against all of the input shaders.
     */
    fs: {
        source: string;
        outputType: number;
    }[];
    /**
     * Additional uniforms to inject into the program.
     */
    uniforms?: IUniform[] | ((layer: PostProcessLayer) => IUniform[]);
    /**
     * Tells the layer to not redraw on update. Otherwise, The layer will redraw
     * every frame by default.
     */
    preventDraw?: boolean;
}
/**
 * This layer takes in several resources and sets up an appropriate geometry and
 * shader IO to allow for an aggregation shader to be specified.
 */
export declare class PostProcessLayer extends Layer<PostProcessInstance, IPostProcessLayer> {
    static defaultProps: IPostProcessLayer;
    initShader(): IShaderInitialization<PostProcessInstance>;
    shouldDrawView(): boolean;
    getMaterialOptions(): Omit<import("../../../../util").CommonMaterial, "modify>">;
}
