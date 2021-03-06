import { IColorBufferResource } from "../../../resources/color-buffer";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { UniformSize } from "../../../types";
import { postProcess } from "../../post-process";

export interface IGaussHorizontalBlur {
  /** Specifies the resource taken in that will be blurred for the output */
  input: IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: Record<number, IRenderTextureResource | IColorBufferResource>;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function gaussHorizontalBlur(options: IGaussHorizontalBlur) {
  const { output, input } = options;

  return postProcess({
    printShader: options.printShader,
    view: output ? { output: { buffers: output, depth: false } } : void 0,
    buffers: { color: input },
    shader: require("./gauss-horizontal-blur.fs"),
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
