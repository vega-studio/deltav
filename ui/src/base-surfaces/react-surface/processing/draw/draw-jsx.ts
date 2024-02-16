import Debug from "debug";
import { PostProcessJSX } from "../post-process-jsx";
import { IView2DProps } from "../../../../2d";
import { ILayerMaterialOptions } from "../../../../types";

const debug = Debug("performance");

export interface IDrawJSX {
  /**
   * Specifies the resource taken in that will be blurred for the output.
   *
   * NOTE: Probably should disable mipmaps if you aren't seeing an output.
   */
  input: string;
  /** Specifies an output resource key to send the results to */
  output?: string;
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
  /** The name applied to the scenes this produces */
  name?: string;
}

/**
 * Simply renders in the input target resource to the screen as a full screen
 * quad.
 */
export function DrawJSX(props: IDrawJSX) {
  const { output, input, channel, grayScale } = props;

  return PostProcessJSX({
    printShader: props.printShader,
    view: Object.assign(
      output ? { output: { buffers: output, depth: false } } : {},
      props.view
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
    material: props.material,

    /** Inspect the resources for feedback on their configuration */
    onResources: (resources) => {
      Object.values(resources).forEach((resource) => {
        if (
          !resource.textureSettings ||
          resource.textureSettings.generateMipMaps
        ) {
          debug(
            "POSSIBLE ERROR: for the draw post effect,",
            "it is a common mistale to leave mipmaps enabled on the input texture.",
            "Often the mipmaps are not available in the target resource and thus",
            "you will get a blank output when rendering in certain scenarios."
          );
        }
      });
    },
  });
}
