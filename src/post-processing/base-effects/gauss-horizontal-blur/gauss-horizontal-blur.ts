import {
  IRenderTextureResource,
  isRenderTextureResource
} from "../../../resources/texture/render-texture";
import { UniformSize } from "../../../types";
import { postProcess } from "../../post-process";

export interface IGaussHorizontalBlur {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string | IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: string | IRenderTextureResource;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function gaussHorizontalBlur(options: IGaussHorizontalBlur) {
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
    shader: require("./gauss-horizontal-blur.fs"),
    uniforms: [
      {
        name: "weight",
        size: UniformSize.FLOAT_ARRAY,
        update: () => [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216]
      }
    ]
  });
}
