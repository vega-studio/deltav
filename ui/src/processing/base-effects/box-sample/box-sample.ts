import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import {
  FragmentOutputType,
  ILayerMaterialOptions,
  UniformSize,
} from "../../../types";
import { postProcess } from "../../post-process";
import BoxSampleFS from "./box-sample.fs";

export enum BoxSampleDirection {
  DOWN,
  UP,
}

export interface IBoxSample {
  /** Specifies the resource taken in that will be blurred for the output */
  input: IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: IRenderTextureResource;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Set for down or up sampling */
  direction: BoxSampleDirection;
  /** Options to send to the view */
  view?: Partial<IView2DProps>;
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
export function boxSample(options: IBoxSample) {
  const { output, input } = options;

  return postProcess({
    printShader: options.printShader,
    view: Object.assign(
      output
        ? {
            output: {
              buffers: { [FragmentOutputType.COLOR]: output },
              depth: false,
            },
          }
        : {},
      options.view
    ),
    buffers: { color: input },
    shader: BoxSampleFS,
    material: options.material,
    uniforms: [
      {
        name: "delta",
        size: UniformSize.ONE,
        update: () => (options.direction === BoxSampleDirection.DOWN ? 1 : 0.5),
      },
    ],
  });
}
