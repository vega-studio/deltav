import { IView2DProps } from "../../../2d";
import { IRenderTextureResource } from "../../../resources/texture/render-texture";
import { ClearFlags, ISceneOptions } from "../../../surface";
import { FragmentOutputType, ILayerMaterialOptions } from "../../../types";
import { postProcess } from "../../post-process";

export interface ITrail {
  /**
   * Specifies the texture that has the previous trail and the texture to add to
   * the trail.
   */
  input: {
    trail: IRenderTextureResource;
    add: IRenderTextureResource;
  };
  /**
   * This specifies the texture to render the new trail to. If not provided,
   * this will render to the screen.
   */
  output: IRenderTextureResource;
  /** For debugging only. Prints generated shader to the console. */
  printShader?: boolean;
  /** Options to send to the view */
  view?: Partial<IView2DProps>;
  /**
   * Allows you to control material options such as blend modes of the post
   * process effect.
   */
  material?: ILayerMaterialOptions;
  /**
   * The trailing effect's intensity. 1 means infinite trail. 0 means no trail
   */
  intensity?: number;
}

/**
 * Applies a trailing effect by doing a non-clearing additive effect of another
 * texture. Then applies the result to the trail texture slightly faded.
 */
export function trail(options: ITrail): ISceneOptions[] {
  const { output, input, view } = options;
  const process: ISceneOptions[] = [];

  process.push(
    postProcess({
      printShader: options.printShader,
      // Set the buffers we want to composite
      buffers: {
        trailTex: input.trail,
        addTex: input.add,
      },
      // Turn off blending
      material: {
        blending: null,
      },
      // Render to the screen, or to a potentially specified target
      view: {
        ...{
          clearFlags: [ClearFlags.COLOR],
          output: {
            buffers: { [FragmentOutputType.COLOR]: output },
            depth: false,
          },
        },
        ...view,
      },
      // Utilize our composition shader
      shader: `
          varying vec2 texCoord;

          void main() {
            // Add the trailTex and addTex but fade out the trailTex slightly
            vec4 addT = texture2D(addTex, texCoord);
            vec4 trailT = texture2D(trailTex, texCoord);
            vec4 result = addT.rgba * addT.a + trailT.rgba * trailT.a;

            gl_FragColor = result;
          }
        `,
    }) as any
  );

  process.push(
    postProcess({
      printShader: options.printShader,
      // Set the buffers we want to composite
      buffers: {
        tex: output,
      },
      // Turn off blending
      material: {
        blending: null,
      },
      // Render the composited textures back to the trail input but faded back a
      // little.
      view: {
        ...{
          output: {
            buffers: { [FragmentOutputType.COLOR]: input.trail },
            depth: false,
          },
        },
        ...view,
      },
      // Utilize our composition shader
      shader: `
        varying vec2 texCoord;

        void main() {
          vec4 fade = texture2D(tex, texCoord);
          fade.a *= ${options.intensity || 0.7};
          $\{out: color} = fade;
        }
      `,
    }) as any
  );

  return process;
}
