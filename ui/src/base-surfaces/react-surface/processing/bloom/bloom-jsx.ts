import { IView2DProps } from "../../../../2d";
import { GLSettings } from "../../../../gl";
import {
  FragmentOutputType,
  type ILayerMaterialOptions,
  UniformSize,
  ShaderInjectionTarget,
} from "../../../../types";
import { createUniform } from "../../../../util";
import { IPartialViewJSX } from "../../scene/view-jsx";
import {
  BoxSampleJSXDirection,
  BoxSampleJSX,
} from "../box-sample/box-sample-jsx";
import { PostProcessJSX } from "../post-process-jsx";

export interface IBloomJSX {
  /** Name to apply to the scenes this produces */
  name?: string;
  /**
   * Number of downsamples used for the bloom effect. This MUST be at least 1
   * for any effect to take place.
   */
  samples: number;
  /**
   * Specify resources in this order for the effect to work:
   * [
   *   glow colors,
   *   half of glow resource (RGB),
   *   quarter of glow (RGB),
   *   eigth of glow (RGB),
   *   ...,
   *   # of steps
   * ]
   * This bloom effect down samples then up samples the results, thus the need
   * for all of the resource specifications.
   */
  resources: string[];
  /**
   * Specifies the output image the bloom effect will be composed with. If this
   * is not specified, this will not do a final composition and just leave the
   * result of the glow filter portion within the top level resource key
   * provided.
   */
  compose?: string;
  /**
   * This specifies an alternative output to target with the results. If not
   * specified the output will render to the screen.
   */
  output?: string;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Options to send to the view */
  view?: IPartialViewJSX<IView2DProps>;
  /**
   * Allows you to control material options such as blend modes of the post
   * process effect.
   */
  material?: ILayerMaterialOptions;
  /**
   * Sometimes bloom can pick up very microscopic artifacts that creates a
   * "light bleed" effect (looks like a ghostly halo). Set this value to a
   * number usually between 2 to 5 to decrease the glow slightly and filter out
   * faint effects.
   */
  gammaCorrection?: number;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function BloomJSX(props: IBloomJSX) {
  const { compose, output, resources, view } = props;

  const addBlend = {
    blending: {
      blendDst: GLSettings.Material.BlendingDstFactor.One,
      blendSrc: GLSettings.Material.BlendingSrcFactor.One,
      blendEquation: GLSettings.Material.BlendingEquations.Add,
    },
  };

  const process: React.JSX.Element[] = [];

  // Generate down samples
  for (let i = 0, iMax = props.samples; i < iMax; ++i) {
    const sample: any = BoxSampleJSX({
      name: `${props.name}.box-down${i}`,
      printShader: props.printShader,
      input: resources[i],
      output: resources[i + 1],
      direction: BoxSampleJSXDirection.DOWN,
      material: {
        blending: void 0,
      },
    });

    process.push(sample);
  }

  // Generate up samples
  for (let i = props.samples - 1; i > 0; --i) {
    const sample: any = BoxSampleJSX({
      name: `${props.name}.box-up${i}`,
      printShader: props.printShader,
      input: resources[i + 1],
      output: resources[i],
      direction: BoxSampleJSXDirection.UP,
      material: addBlend,
    });

    process.push(sample);
  }

  // Generate the composition process
  if (compose) {
    process.push(
      PostProcessJSX({
        name: `${props.name}.compose`,
        printShader: props.printShader,
        // Set the buffers we want to composite
        buffers: {
          color: compose,
          glow: resources[1],
        },
        // Turn off blending
        material: addBlend,
        // Render to the screen, or to a potentially specified target
        view: {
          ...(output
            ? {
                output: {
                  buffers: { [FragmentOutputType.COLOR]: output },
                  depth: false,
                },
              }
            : void 0),
          ...view,
        },
        uniforms: [
          createUniform({
            name: "gamma",
            size: UniformSize.ONE,
            shaderInjection: ShaderInjectionTarget.ALL,
            update: () => [props.gammaCorrection || 1],
          }),
        ],
        // Utilize our composition shader
        shader: `
          varying vec2 texCoord;

          void main() {
            vec3 base = texture2D(color, texCoord).rgb;
            vec3 glow = texture2D(glow, texCoord).rgb;

            ${
              props.gammaCorrection !== void 0
                ? `
              vec3 result = mix(
                base,
                glow + base,
                ((glow.r + glow.g + glow.b) * gamma)
              );
            `
                : `
              vec3 result = base + glow;
            `
            }


            gl_FragColor = vec4(result, 1.0);
          }
        `,
      })
    );
  }

  return process;
}
