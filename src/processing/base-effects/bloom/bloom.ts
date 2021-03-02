import { IView2DProps } from "../../../2d";
import { GLSettings } from "../../../gl/gl-settings";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { FragmentOutputType, ILayerMaterialOptions } from "../../../types";
import { postProcess } from "../../post-process";
import { boxSample, BoxSampleDirection } from "../box-sample/box-sample";

export interface IBloom {
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
  resources: IRenderTextureResource[];
  /**
   * Specifies the output image the bloom effect will be composed with. If this
   * is not specified, this will not do a final composition and just leave the
   * result of the glow filter portion within the top level resource key
   * provided.
   */
  compose?: IRenderTextureResource;
  /**
   * This specifies an alternative output to target with the results. If not
   * specified the output will render to the screen.
   */
  output?: IRenderTextureResource;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Options to send to the view */
  view?: Partial<IView2DProps>;
  /**
   * Allows you to control material options such as blend modes of the post
   * process effect.
   */
  material?: ILayerMaterialOptions;
}

/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export function bloom(options: IBloom) {
  const { compose, output, resources } = options;

  const addBlend = {
    blending: {
      blendDst: GLSettings.Material.BlendingDstFactor.One,
      blendSrc: GLSettings.Material.BlendingSrcFactor.One,
      blendEquation: GLSettings.Material.BlendingEquations.Add
    }
  };

  const process: Record<string, any> = {};

  // Generate down samples
  for (let i = 0, iMax = options.samples; i < iMax; ++i) {
    const sample = boxSample({
      printShader: options.printShader,
      input: resources[i],
      output: resources[i + 1],
      direction: BoxSampleDirection.DOWN,
      material: {
        blending: void 0
      }
    });

    process[`downSample${i}`] = sample;
  }

  // Generate up samples
  for (let i = options.samples - 1; i > 0; --i) {
    const sample = boxSample({
      printShader: options.printShader,
      input: resources[i + 1],
      output: resources[i],
      direction: BoxSampleDirection.UP,
      material: addBlend
    });

    process[`upSample${i}`] = sample;
  }

  // Generate the composition process
  if (compose) {
    process.compose = postProcess({
      printShader: options.printShader,
      // Set the buffers we want to composite
      buffers: {
        color: compose,
        glow: resources[1]
      },
      // Turn off blending
      material: {
        blending: null
      },
      // Render to the screen, or to a potentially specified target
      view: output
        ? {
            output: {
              buffers: { [FragmentOutputType.COLOR]: output },
              depth: false
            }
          }
        : void 0,
      // Utilize our composition shader
      shader: require("./bloom.fs")
    });
  }

  return process;
}
