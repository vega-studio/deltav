import { IView2DProps } from "../../../2d";
import {
  IRenderTextureResource,
  isRenderTextureResource
} from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions, UniformSize } from "../../../types";
import { postProcess } from "../../post-process";

export enum BoxSampleDirection {
  DOWN,
  UP
}

export interface IBoxSample {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string | IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: string | IRenderTextureResource;
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
  let outputKey, inputKey;

  if (isRenderTextureResource(output)) {
    outputKey = output.key;
  } else {
    outputKey = output;
  }

  if (isRenderTextureResource(input)) {
    inputKey = input.key;
  } else {
    inputKey = input;
  }

  return postProcess({
    printShader: options.printShader,
    view: Object.assign(
      outputKey ? { output: { buffers: outputKey, depth: false } } : {},
      options.view
    ),
    buffers: { color: inputKey },
    shader: require("./box-sample.fs"),
    material: options.material,
    uniforms: [
      {
        name: "delta",
        size: UniformSize.ONE,
        update: () => (options.direction === BoxSampleDirection.DOWN ? 1 : 0.5)
      }
    ]
  });
}