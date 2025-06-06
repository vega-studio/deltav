import { IView2DProps } from "../../../../2d";
import {
  FragmentOutputType,
  ILayerMaterialOptions,
  ShaderInjectionTarget,
  UniformSize,
} from "../../../../types.js";
import { IPartialViewJSX } from "../../scene/view-jsx.js";
import { PostProcessJSX } from "../post-process-jsx.js";
import BoxSampleFS from "./box-sample-jsx.fs";

export enum BoxSampleJSXDirection {
  DOWN,
  UP,
}

export interface IBoxSampleJSX {
  /** Name to apply to the scenes this produces */
  name: string;
  /** Specifies the resource taken in that will be blurred for the output */
  input: string;
  /** Specifies an output resource key to send the results to */
  output?: string;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Set for down or up sampling */
  direction: BoxSampleJSXDirection;
  /** Options to send to the view */
  view?: IPartialViewJSX<IView2DProps>;
  /**
   * Allows you to control material options such as blend modes of the post
   * process effect.
   */
  material?: ILayerMaterialOptions;
}

/**
 * Performs downsampling or upsampling of an image by utilizing the linear
 * interpolation properties of texture samplong using the GPU.
 */
export function BoxSampleJSX(props: IBoxSampleJSX) {
  const { output, input } = props;

  return PostProcessJSX({
    name: props.name,
    printShader: props.printShader,
    output: output
      ? {
          buffers: { [FragmentOutputType.COLOR]: output },
          depth: false,
        }
      : void 0,
    view: props.view,
    buffers: { sourceTex: input },
    shader: BoxSampleFS,
    material: props.material,
    uniforms: [
      {
        name: "delta",
        size: UniformSize.ONE,
        shaderInjection: ShaderInjectionTarget.FRAGMENT,
        update: () =>
          props.direction === BoxSampleJSXDirection.DOWN ? 1 : 0.5,
      },
    ],
  });
}
