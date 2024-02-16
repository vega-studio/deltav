import { UniformSize } from "../../../../types";
import { PostProcessJSX } from "../post-process-jsx";
import GaussHorizontalBlurFS from "./gauss-horizontal-blur-jsx.fs";

export interface IGaussHorizontalBlurJSX {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string;
  /** Specifies an output resource key to send the results to */
  output?: Record<number, string>;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** A name applied to the scenes this produces */
  name?: string;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function GaussHorizontalBlurJSX(props: IGaussHorizontalBlurJSX) {
  const { output, input } = props;

  return PostProcessJSX({
    printShader: props.printShader,
    view: output ? { output: { buffers: output, depth: false } } : void 0,
    buffers: { color: input },
    shader: GaussHorizontalBlurFS,
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
