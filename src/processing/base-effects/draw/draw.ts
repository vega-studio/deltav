import { IView2DProps } from "../../../2d";
import {
  IRenderTextureResource,
  isRenderTextureResource
} from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions } from "../../../types";
import { postProcess } from "../../post-process";

export interface IDrawOptions {
  /** Specifies the resource taken in that will be blurred for the output */
  input: string | IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
  output?: string | IRenderTextureResource;
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
 * Simply renders in the input target resource to the screen as a full screen
 * quad.
 */
export function draw(options: IDrawOptions) {
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
    shader: require("./draw.fs"),
    material: options.material
  });
}
