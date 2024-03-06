import { createUniform, isDefined } from "../../../../util";
import {
  FragmentOutputType,
  isNumber,
  ShaderInjectionTarget,
  UniformSize,
} from "../../../../types";
import { inverse2, vec2, type Vec2, type Vec3 } from "../../../../math";
import { PostProcessJSX } from "../post-process-jsx";

export interface ISimplexNoiseJSX {
  /** Name/key to apply to the scenes generated by this effect */
  name: string;
  /** The resource to output the rendered perlin noise to */
  output: string;
  /**
   * We render the perlin noise as a 3D perlin noise but just a 2D slice of it.
   * This let's you set the 3D offset of the 2D noise
   */
  zOffset?: number | (() => number);
  /**
   * If this is specified rather than the zOffset, the zoffset will
   * automatically drift by this amount
   */
  drift?: Vec3;
  /**
   * Larger the scale, the larger the features. Defaults to 1 which will look
   * very grainy. A value of 200 sees more blobby features. Can not be 0.
   *
   * You can specify multiple scales to generate octaves for the noise pattern.
   */
  scale?: Vec2 | Vec2[];
}

function isVec2Array(x: Vec2 | Vec2[]): x is Vec2[] {
  return Array.isArray(x[0]);
}

export const SimplexNoiseJSX = (props: ISimplexNoiseJSX) => {
  const propsScale = props.scale || vec2(1, 1);
  const scaleArray: Vec2[] = isVec2Array(propsScale)
    ? propsScale
    : ([props.scale] as Vec2[]);
  const scales = scaleArray.map((a) => inverse2(a));
  const scaleFactor = 1 / scales.length;

  if (isDefined(props.drift)) {
    const drift = props.drift;

    return PostProcessJSX({
      name: props.name,
      buffers: {},
      view: {
        output: {
          buffers: {
            [FragmentOutputType.COLOR]: props.output,
          },
          depth: false,
        },
      },
      uniforms: [
        createUniform({
          name: "drift",
          size: UniformSize.THREE,
          shaderInjection: ShaderInjectionTarget.FRAGMENT,
          update: () => drift,
        }),
      ],
      shader: `
        $\{import: time, simplexNoise3D}

        void main() {
          float value = 0.;
          ${scales
            .map(
              (s) =>
                `value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${s[0]}f, ${s[1]}f), 0.) + (drift * time));`
            )
            .join("\n")}
          value *= ${scaleFactor.toFixed(1)}f;
          $\{out: color} = vec4(value, value, value, 1.);
        }
      `,
    });
  } else if (isDefined(props.zOffset)) {
    const zOffset = props.zOffset;

    return PostProcessJSX({
      name: props.name,
      buffers: {},
      view: {
        output: {
          buffers: {
            [FragmentOutputType.COLOR]: props.output,
          },
          depth: false,
        },
      },
      uniforms: [
        createUniform({
          name: "zOffset",
          size: UniformSize.ONE,
          update: isNumber(zOffset) ? () => [zOffset] : () => [zOffset()],
        }),
      ],
      shader: `
        $\{import: simplexNoise3D}

        void main() {
          float value = 0.;
          ${scales
            .map(
              (s) => `
            value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${s[0]}f, ${s[1]}f), zOffset));
          `
            )
            .join("\n")}
          value *= ${scaleFactor.toFixed(1)}f;
          $\{out: color} = vec4(value, value, value, 1.);
        }
      `,
    });
  } else {
    return PostProcessJSX({
      name: props.name,
      buffers: {},
      view: {
        output: {
          buffers: {
            [FragmentOutputType.COLOR]: props.output,
          },
          depth: false,
        },
      },
      shader: `
        $\{import: simplexNoise2D}

        void main() {
          float value = 0.;
          ${scales
            .map(
              (s) => `
            value += simplexNoise2D(gl_FragCoord.xy * vec2(${s[0]}f, ${s[1]}f));
          `
            )
            .join("\n")}
          value *= ${scaleFactor.toFixed(1)}f;
          $\{out: color} = vec4(value, value, value, 1.);
        }
      `,
    });
  }
};
