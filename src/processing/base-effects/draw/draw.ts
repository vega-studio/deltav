import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { ILayerMaterialOptions } from "../../../types";
import { postProcess } from "../../post-process";

const debug = require("debug")("performance");

export interface IDrawOptions {
  /**
   * Specifies the resource taken in that will be blurred for the output.
   *
   * NOTE: Probably should disable mipmaps if you aren't seeing an output.
   */
  input: IRenderTextureResource;
  /** Specifies an output resource key to send the results to */
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
  /** If specified, will only draw a single channel from the target */
  channel?: "r" | "g" | "b" | "a";
  /**
   * If channel AND this are set, the channel selected will be rendered in gray
   * scale
   */
  grayScale?: boolean;
}

/**
 * Simply renders in the input target resource to the screen as a full screen
 * quad.
 */
export function draw(options: IDrawOptions) {
  const { output, input, channel, grayScale } = options;

  if (!input.textureSettings || input.textureSettings.generateMipMaps) {
    debug(
      "POSSIBLE ERROR: for the draw post effect,",
      "it is a common mistale to leave mipmaps enabled on the input texture.",
      "Often the mipmaps are not available in the target resource and thus",
      "you will get a blank output when rendering in certain scenarios."
    );
  }

  return postProcess({
    printShader: options.printShader,
    view: Object.assign(
      output ? { output: { buffers: output, depth: false } } : {},
      options.view
    ),
    buffers: { color: input },
    shader:
      grayScale && channel
        ? `
      varying vec2 texCoord;

      void main() {
        gl_FragColor = vec4(texture2D(color, texCoord).${channel}${channel}${channel}, 1.);
      }
    `
        : channel
        ? `
      varying vec2 texCoord;

      void main() {
        gl_FragColor = vec4(texture2D(color, texCoord).${channel}, 0., 0., 1.);
      }
    `
        : `
      varying vec2 texCoord;

      void main() {
        gl_FragColor = texture2D(color, texCoord);
      }
    `,
    material: options.material
  });
}
