import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  Camera2D,
  ClearFlags,
  createUniform,
  FragmentOutputType,
  LayerJSX,
  PostProcessJSX,
  PromiseResolver,
  SceneJSX,
  ShaderInjectionTarget,
  Surface,
  SurfaceJSX,
  UniformSize,
  View2D,
  ViewJSX,
} from "../../src";
import { VertexPointsLayer } from "../../src/2d/layers/vertex-points/vertex-points-layer.js";
import { FloatTextureJSX } from "../../src/base-surfaces/react-surface/resource/float-texture-jsx.js";

export default {
  title: "Deltav/FloatTexture",
  args: {},
  argTypes: {},
};

let cacheData: Float32Array | null = null;

function createFloatTextureData(
  width: number,
  height: number,
  regionWidth: number,
  regionHeight: number,
  speed: number = 3,
  minSpeed: number = 1
) {
  if (cacheData && cacheData.length === width * height * 4) {
    return cacheData;
  }

  const count = width * height;
  const data = new Float32Array(count * 4);
  let x, y, vx, vy;

  for (let i = 0; i < count; i++) {
    x = 0 + Math.random() * regionWidth;
    y = Math.random() * regionHeight;
    vx = Math.random() * speed + minSpeed;
    vy = 1.0;

    data.set([x, y, vx, vy], i * 4);
  }

  cacheData = data;
  return data;
}

function viewSize(surface: Surface | null, viewId: string) {
  if (!surface) {
    return [1000, 1000];
  }

  const size = surface.getViewSize(viewId);

  if (!size) {
    return [1000, 1000];
  }

  return [size.width, size.height];
}

export const Basic: StoryFn = (() => {
  const pointsWidth = 500;
  const pointsHeight = 500;
  const numPoints = pointsWidth * pointsHeight;
  const ready = React.useRef(new PromiseResolver<Surface>());
  const surface = React.useRef<Surface | null>(null);

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      surface.current = await ready.current.promise;

      const size = surface.current?.getViewSize("main.main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      return () => {};
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <FloatTextureJSX
        name="float-a"
        width={pointsWidth}
        height={pointsHeight}
        channels={4}
        data={createFloatTextureData(pointsWidth, pointsHeight, 1000, 1000)}
      />
      <FloatTextureJSX
        name="float-b"
        width={pointsWidth}
        height={pointsHeight}
        channels={4}
        data={createFloatTextureData(pointsWidth, pointsHeight, 1000, 1000)}
      />
      {/*
       * We render from a source float texture of previous frame to the target
       * texture which is the current frame. Then those get swapped to ping pong
       * rendering as the current frame will need to become the previous frame
       * so we can keep progressing the simulation.
       */}
      {PostProcessJSX({
        // Render target will swap from b to a
        output: [
          {
            buffers: {
              [FragmentOutputType.COLOR]: "float-b",
            },
            depth: false,
          },
          {
            buffers: {
              [FragmentOutputType.COLOR]: "float-a",
            },
            depth: false,
          },
        ],
        // Our input buffer be reversed as we will swap from a to b
        buffers: { dataTex: ["float-a", "float-b"] },
        name: "postprocess",
        uniforms: [
          createUniform({
            name: "screenSize",
            shaderInjection: ShaderInjectionTarget.FRAGMENT,
            size: UniformSize.TWO,
            update: () => viewSize(surface.current, "main.main"),
          }),
        ],
        material: {
          blending: null,
        },
        shader: [
          {
            outputType: FragmentOutputType.COLOR,
            source: `
              $\{import: frame, random}

              float rand(vec2 co) {
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
              }

              void main() {
                vec4 data = texture(dataTex, texCoord);
                vec2 pos = data.xy;
                vec2 vel = data.zw;

                pos += vel;

                if (pos.x > screenSize.x) {
                  pos.y = rand(pos) * screenSize.y;
                  pos.x = rand(pos) * -screenSize.x;
                  vel = vec2(rand(pos) * 10.0 + 1.0, rand(pos)); // reset upward velocity
                }

                if (pos.y < 0.0) pos.y = screenSize.y;
                if (pos.y > screenSize.y) pos.y = 0.0;

                // $\{out: color} = vec4(pos * 0.98, vel);
                $\{out: color} = vec4(pos, vel);
              }
            `,
          },
        ],
      })}

      {/*
       * We will now render the current frame with our geometry where each
       * vertex represents a single float point value.
       */}
      <SceneJSX name="main">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: new Camera2D(),
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <LayerJSX
          type={VertexPointsLayer}
          uses={{
            names: ["float-a", "float-b"],
            apply: (resources, config) => {
              config.resources = {
                // First output b, then output a
                dataTex: [resources["float-b"], resources["float-a"]],
              };
              return config;
            },
          }}
          config={{
            numPoints,
            dataSourceSize: {
              attributeName: "dataUV",
              width: pointsWidth,
              height: pointsHeight,
            },
            vs: `
              $\{import: frame}
              varying vec2 _color;

              void main() {
                vec4 data = texture(dataTex, dataUV);
                gl_Position = clipSpace(vec3(data.xy, 0.0));
                gl_PointSize = clamp(length(data.zw), 1.0, 10.0) / 2.0;
                _color = vec2(1.0, 1.0);
              }
            `,
            fs: [
              {
                outputType: FragmentOutputType.COLOR,
                source: `
                  varying vec2 _color;
                  void main() {
                    $\{out: color} = vec4(_color, 1.0, 1.0);
                  }
                `,
              },
            ],
          }}
        />
      </SceneJSX>
    </SurfaceJSX>
  );
}).bind({});
