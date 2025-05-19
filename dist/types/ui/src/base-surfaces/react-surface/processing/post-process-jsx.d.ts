import React from "react";
import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources";
import { ILayerMaterialOptions, IUniform } from "../../../types.js";
import { IPartialViewJSX } from "../scene/view-jsx.js";
import { PostProcessLayer } from "./layer/post-process-layer.js";
export interface IPostProcessJSX {
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
    uniforms?: IUniform[] | ((layer: PostProcessLayer) => IUniform[]);
    /**
     * Use this to modify the View2D being used to produce this quad. You can use
     * these options to redirect the output of this step to another resource if
     * desired.
     */
    view?: IPartialViewJSX<IView2DProps>;
    /**
     * For debugging purposes only. Prints the shader generated to the console.
     */
    printShader?: boolean;
    /** Name applied to the scene generated for this */
    name: string;
    /** Indicates if the effect should not be rendered */
    preventDraw?: boolean;
    /**
     * Executes when the resources are retrieved and applied to this process. This
     * is promarily for introspection on the resources to provided feedback via
     * logs. It has little utility for anything else and should not be abused.
     */
    onResources?: (resources: Record<string, IRenderTextureResource>) => void;
}
export declare const PostProcessJSX: (props: IPostProcessJSX) => React.JSX.Element;
