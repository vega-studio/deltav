import { IView2DProps } from "../2d";
import { ILayerMaterialOptions, IUniform } from "../types";
export interface IPostProcess {
    /**
     * This specifies the texture buffers the post processing shaders will
     * utilize. The keys for this property will be the names of the textures
     * available within your shaders.
     *
     * ie -
     * buffers: { color: "colorTextureKey" }
     *
     * will make the uniform sampler "color" be available in your shader and will
     * provide the resource with the key "colorTextureKey".
     */
    buffers: Record<string, string>;
    /**
     * Custom material options to apply to the layer to aid in controlling
     * blending etc.
     */
    material?: ILayerMaterialOptions;
    /** This is the shader program you will be using when you  */
    shader: string;
    /**
     * Use this to specify some additional uniforms your shader may use.
     * NOTE: Remember to use ShaderInjectionTarget Fragment only! You are not
     * writing a vertex shader here!
     */
    uniforms?: IUniform[];
    /**
     * Use this to modify the View2D being used to produce this quad. You can use
     * these options to redirect the output of this step to another resource if
     * desired.
     */
    view?: Partial<IView2DProps>;
    /**
     * For debugging purposes only. Prints the shader generated to the console.
     */
    printShader?: boolean;
}
/**
 * This creates a scene, view, and layer configuration quickly. This will
 * perform the task of setting up a screen quad that will let you composite
 * several textures into a single output. This output can either be rendered to
 * the screen directly or target another texture to render to.
 */
export declare function postProcess(options: IPostProcess): {
    views: {
        screen: import("../surface/view").ViewInitializer<IView2DProps>;
    };
    layers: {
        screen: import("..").LayerInitializer;
    };
};
