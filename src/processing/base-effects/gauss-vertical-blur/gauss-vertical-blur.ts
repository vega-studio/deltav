import {
  IRenderTextureResource,
  isRenderTextureResource
} from "../../../resources/texture/render-texture";
import { UniformSize } from "../../../types";
import { postProcess } from "../../post-process";

export interface IGaussVerticalBlur {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string | IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: string | IRenderTextureResource;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
}

/**
 * Performs a gaussian vertical blur on a resource and outputs to a specified
 * resource.
 */
export function gaussVerticalBlur(options: IGaussVerticalBlur) {
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
    view: outputKey ? { output: { buffers: outputKey, depth: false } } : void 0,
    buffers: { color: inputKey },
    shader: require("./gauss-vertical-blur.fs"),
    uniforms: [
      {
        name: "weight",
        size: UniformSize.FLOAT_ARRAY,
        update: () => [
          0.299478,
          0.22598,
          0.097046,
          0.023687,
          0.003279,
          0.000257,
          0.000011
        ]
      }
    ]
  });
}
