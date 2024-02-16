import { IView2DProps } from "../../../../2d";
import { ClearFlags } from "../../../../surface";
import { FragmentOutputType, ILayerMaterialOptions } from "../../../../types";
import { IPartialViewJSX } from "../../scene/view-jsx";
import { PostProcessJSX } from "../post-process-jsx";

export interface ITrailJSX {
  /**
   * Specifies the texture that has the previous trail and the texture to add to
   * the trail.
   */
  input: {
    trail: string;
    add: string;
  };
  /**
   * This specifies the texture to render the new trail to. If not provided,
   * this will render to the screen.
   */
  output: string;
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
   * The trailing effect's intensity. 1 means infinite trail. 0 means no trail
   */
  intensity?: number;
  /** The name to apply to the scenes this effect produces */
  name?: string;
}

/**
 * Applies a trailing effect by doing a non-clearing additive effect of another
 * texture. Then applies the result to the trail texture slightly faded.
 */
export function TrailJSX(props: ITrailJSX) {
  const { output, input, view } = props;
  const process: React.JSX.Element[] = [];

  process.push(
    PostProcessJSX({
      name: props.name || "trail-effect",
      printShader: props.printShader,
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
          config: {
            clearFlags: [ClearFlags.COLOR],
          },
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

            // Blend the textures
            float alpha = addT.a + trailT.a * (1.0 - addT.a); // Compute final alpha
            vec3 color;
            if (alpha > 0.0) { // Avoid division by zero
              color = (addT.rgb * addT.a + trailT.rgb * trailT.a * (1.0 - addT.a)) / alpha;
            } else {
              color = vec3(0.0); // Fallback to black (or any other fallback color)
            }

            gl_FragColor = vec4(color, alpha);
          }
        `,
    }) as any
  );

  process.push(
    PostProcessJSX({
      printShader: props.printShader,
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
          fade.rgba *= ${props.intensity || 0.7};
          $\{out: color} = fade;
        }
      `,
    }) as any
  );

  return process;
}
