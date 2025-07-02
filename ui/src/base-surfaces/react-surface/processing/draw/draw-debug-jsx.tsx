import React from "react";

import { ClearFlags, isString, PostProcessJSX } from "../../../../index.js";
import type { Vec4 } from "../../../../math/vector.js";
import { DrawJSX, type IDrawJSX } from "./draw-jsx.js";

export interface IDrawDebugJSX {
  /**
   * List of all textures we should render to the screen in a grid. Supports up
   * to 16.
   */
  inputs: (
    | string
    | {
        key: string;
        position?: boolean;
        depth?: boolean;
        channels?: IDrawJSX["channel"][];
      }
  )[];

  /** The background clear color of the textures when rendered to the screen */
  background: Vec4;
}

/**
 * Debug textures quickly by rendering them to the screen in a grid.
 */
export function DrawDebugJSX(props: IDrawDebugJSX) {
  let index = 0;

  const getViewPort = () => {
    const col = Math.floor(index / 4);
    const row = index % 4;

    const viewport = {
      left: `${col * 23 + 5}%`,
      top: `${row * 23 + 5}%`,
      width: "20%",
      height: "20%",
    };

    index++;

    return viewport;
  };

  return (
    <>
      {props.inputs.flatMap((input) => {
        const draw = isString(input)
          ? DrawJSX({
              name: `draw-debug-${index}`,
              input,
              view: {
                config: {
                  background: props.background,
                  clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                  viewport: getViewPort(),
                },
              },
            })
          : input.depth
          ? PostProcessJSX({
              name: `draw-debug-${index}`,
              buffers: {
                tex: input.key,
              },
              view: {
                config: {
                  background: [0.1, 0.1, 0.1, 1],
                  clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                  viewport: getViewPort(),
                },
              },
              shader: `
                void main() {
                  // 1) Sample raw depth
                  float z = texture2D(tex, texCoord).r;

                  // 2) Optional: linearize if you want (optional)
                  // z = (2.0 * near) / (far + near - z * (far - near));

                  // 3) Nonlinear boost for near contrast
                  float d = pow(z, 30.0);

                  // 4) Fake fancy color: purple -> pink -> orange -> yellow
                  vec3 color = vec3(0.0);
                  if (d < 0.5) {
                    color = mix(vec3(0.2, 0.0, 0.5), vec3(1.0, 0.0, 0.5), d * 2.0);
                  } else {
                    color = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 1.0, 0.0), (d - 0.5) * 2.0);
                  }

                  $\{out: fragColor} = vec4(color, 1.0);
                }
          `,
            })
          : input.channels
          ? input.channels.map((channel) =>
              DrawJSX({
                name: `draw-debug-${index}`,
                input: input.key,
                channel: channel,
                grayScale: true,
                view: {
                  config: {
                    background: props.background,
                    clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                    viewport: getViewPort(),
                  },
                },
              })
            )
          : DrawJSX({
              name: `draw-debug-${index}`,
              input: input.key,
              view: {
                config: {
                  background: props.background,
                  clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                  viewport: getViewPort(),
                },
              },
            });

        return draw;
      })}
    </>
  );
}
