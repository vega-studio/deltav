import GaussHorizontalBlurFS from "./gauss-horizontal-blur-jsx.fs";
import {
  FragmentOutputType,
  ShaderInjectionTarget,
  UniformSize,
} from "../../../../types.js";
import { PostProcessJSX } from "../post-process-jsx.js";

export interface IGaussHorizontalBlurJSX {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string;
  /**
   * Specifies an output resource key to send the results to. If passes is > 1
   * an output is REQUIRED as the inut and output will reverse per pass to ping
   * pong the results.
   */
  output?: string;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** A name applied to the scenes this produces */
  name: string;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function GaussHorizontalBlurJSX(props: IGaussHorizontalBlurJSX) {
  const { output, input } = props;

  return PostProcessJSX({
    name: props.name,
    printShader: props.printShader,
    view: output
      ? {
          output: {
            buffers: { [FragmentOutputType.COLOR]: output },
            depth: false,
          },
        }
      : void 0,
    buffers: { color: input },
    shader: GaussHorizontalBlurFS,
    uniforms: [
      {
        name: "weight",
        size: UniformSize.FLOAT_ARRAY,
        shaderInjection: ShaderInjectionTarget.FRAGMENT,
        update: () => [
          0.299478, 0.22598, 0.097046, 0.023687, 0.003279, 0.000257, 0.000011,
        ],
      },
    ],
  });
}
