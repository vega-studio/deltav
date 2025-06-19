import React from "react";

import { Camera2D, IView2DProps, View2D } from "../../../2d";
import { GLSettings } from "../../../gl/gl-settings.js";
import { IRenderTextureResource } from "../../../resources";
import {
  FragmentOutputType,
  ILayerMaterialOptions,
  isString,
  IUniform,
  type OutputFragmentShaderSource,
} from "../../../types.js";
import { LayerJSX } from "../scene/layer-jsx.js";
import { SceneJSX } from "../scene/scene-jsx.js";
import { IPartialViewJSX, type IViewJSX, ViewJSX } from "../scene/view-jsx.js";
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
  buffers: Record<string, string | string[]>;
  /**
   * Specify a target output buffer or buffer chain for this process.
   */
  output?: IViewJSX<IView2DProps>["output"];
  /**
   * Custom material options to apply to the layer to aid in controlling
   * blending etc.
   */
  material?: ILayerMaterialOptions;
  /** This is the shader program you will be using when you  */
  shader: OutputFragmentShaderSource;
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
  view?: Omit<IPartialViewJSX<IView2DProps>, "output" | "chain">;
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

/**
 * Offers a convenient means to process a full Quad output with texture buffer
 * data inputs.
 */
export const PostProcessJSX = (props: IPostProcessJSX) => {
  return (
    <SceneJSX key={props.name} name={props.name}>
      <ViewJSX
        name={"fullscreen"}
        type={View2D}
        {...props.view}
        output={props.output}
        config={{
          camera: new Camera2D(),
          viewport: { left: 0, top: 0, width: "100%", height: "100%" },
          materialSettings: {
            depthTest: false,
            culling: GLSettings.Material.CullSide.NONE,
          },
          ...props.view?.config,
        }}
      />
      <LayerJSX
        name="postprocess"
        type={PostProcessLayer}
        uses={{
          names: Object.values(props.buffers).flat(),
          apply: (resources, config) => {
            config.buffers = {};
            Object.keys(props.buffers).map((key) => {
              if (Array.isArray(props.buffers[key])) {
                config.buffers[key] = props.buffers[key].map((buffer) => {
                  return resources[buffer];
                });
              } else {
                config.buffers[key] = resources[props.buffers[key]];
              }
            });
            props.onResources?.(resources);
            return config;
          },
        }}
        config={{
          printShader: props.printShader,
          buffers: {},
          fs: isString(props.shader)
            ? [
                {
                  outputType: FragmentOutputType.COLOR,
                  source: props.shader,
                },
              ]
            : props.shader,
          uniforms: props.uniforms,
          materialOptions: props.material,
          preventDraw: props.preventDraw,
        }}
      />
    </SceneJSX>
  );
};
