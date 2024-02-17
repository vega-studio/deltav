import GaussVerticalBlurFS from "./gauss-vertical-blur.fs";
import { PostProcessJSX } from "../post-process-jsx";
import { UniformSize } from "../../../../types";

export interface IGaussVerticalBlurJSX {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string;
  /** Specifies an output resource key to send the results to */
  output?: Record<number, string>;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Name for the scenes this produces */
  name?: string;
}

/**
 * Performs a gaussian vertical blur on a resource and outputs to a specified
 * resource.
 */
export function GaussVerticalBlurJSX(props: IGaussVerticalBlurJSX) {
  const { output, input } = props;

  return PostProcessJSX({
    name: props.name,
    printShader: props.printShader,
    view: output ? { output: { buffers: output, depth: false } } : void 0,
    buffers: { color: input },
    shader: GaussVerticalBlurFS,
    uniforms: [
      {
        name: "weight",
        size: UniformSize.FLOAT_ARRAY,
        update: () => [
          0.299478, 0.22598, 0.097046, 0.023687, 0.003279, 0.000257, 0.000011,
        ],
      },
    ],
  });
}
