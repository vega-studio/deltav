import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  DrawJSX,
  GLSettings,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  SimplexNoiseJSX,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  View2D,
  ViewDrawMode,
  ViewJSX,
} from "../../src/index.js";

export default {
  title: "Deltav/Noise",
  args: {},
  argTypes: {},
};

export const Simplex2D: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
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
      <TextureJSX
        name="simplex"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB,
        }}
      />
      {SimplexNoiseJSX({
        name: "simplex",
        output: "simplex",
        scale: [200, 200],
      })}
      {DrawJSX({
        name: "draw",
        input: "simplex",
        view: {
          config: {
            drawMode: { mode: ViewDrawMode.FRAME_COUNT, value: 2 },
          },
        },
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Simplex2DWithOctaves: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
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
      <TextureJSX
        name="simplex"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB,
        }}
      />
      {SimplexNoiseJSX({
        name: "simplex",
        output: "simplex",
        scale: [
          [50, 50],
          [100, 100],
          [150, 150],
          [175, 175],
          [200, 200],
          [250, 250],
        ],
      })}
      {DrawJSX({
        name: "draw",
        input: "simplex",
        view: {
          config: {
            drawMode: { mode: ViewDrawMode.FRAME_COUNT, value: 2 },
          },
        },
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Simplex3D: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
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
      <TextureJSX
        name="simplex"
        width={1024}
        height={1024}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB,
          magFilter: GLSettings.Texture.TextureMagFilter.Linear,
        }}
      />
      {SimplexNoiseJSX({
        name: "render-noise",
        output: "simplex",
        scale: [
          [50, 50],
          [100, 100],
          [150, 150],
          [175, 175],
          [200, 200],
          [250, 250],
        ],
        drift: [0.001, 0.001, 0.001],
      })}
      {DrawJSX({
        name: "output",
        input: "simplex",
      })}
    </SurfaceJSX>
  );
}).bind({});

export const PseudoRandom: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const camera = React.useRef<Camera2D>(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());
  const shouldDraw = React.useRef(2);

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      const provider = circleProvider.current;
      if (!provider) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const grid = {
        cellW: 6,
        cellH: 6,
        boardW: 100,
        boardH: 100,
      };

      const cellCount = grid.boardW * grid.boardH;

      function makeRand(range: number, seed = 0) {
        const PI2 = Math.PI * 2;
        const cellRadians = PI2 / range;
        let increment = 0;

        return () => {
          let index = increment + seed;
          index *= Math.tan(index);
          index -= Math.floor(index / PI2) * PI2;
          index = Math.floor(index / cellRadians);
          increment++;

          return index;
        };
      }

      let rand = makeRand(cellCount);

      for (let i = 0; i < cellCount; ++i) {
        const value = rand() / cellCount;
        const cellX = i % grid.boardW;
        const cellY = Math.floor(i / grid.boardH);

        provider.add(
          new CircleInstance({
            radius: 3,
            color: [1, 1, 1, value],
            center: [cellX * grid.cellW, cellY * grid.cellH],
          })
        );
      }

      rand = makeRand(1000);
      const buckets: number[] = [];
      let max = 0;

      for (let i = 0; i < 1000000; ++i) {
        const value = rand();
        const v = (buckets[value] = (buckets[value] || 0) + 1);
        max = Math.max(max, v);
      }

      for (let i = 0, iMax = buckets.length; i < iMax; ++i) {
        const val = buckets[i];

        provider.add(
          new CircleInstance({
            radius: 3,
            color: [1, 1, 1, val / max],
            center: [i * 7, -10],
          })
        );
      }

      // onAnimationLoop(() => {
      //   for (let i = 0; i < 10; ++i) {
      //     let index = instances.length + 23456;
      //     index *= index;
      //     index -= Math.floor(index / (Math.PI * 2)) * Math.PI * 2;
      //     index = Math.floor(index / cellRadians);
      //     const cellX = index % grid.boardW;
      //     const cellY = Math.floor(index / grid.boardH);

      //     const instance = provider.add(
      //       new CircleInstance({
      //         radius: 3,
      //         color: [1, 1, 1, 0.1],
      //         center: [cellX * grid.cellW, cellY * grid.cellH],
      //       })
      //     );

      //     instances.push(instance);
      //   }
      // });

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
      <BasicCamera2DControllerJSX
        config={{
          camera: camera.current,
          onRangeChanged: () => (shouldDraw.current = 1),
        }}
      />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          drawMode: {
            mode: ViewDrawMode.ON_TRIGGER,
            trigger: () => {
              const result = shouldDraw.current;
              shouldDraw.current = result - 1;
              return result > 0;
            },
          },
        }}
      />
      <LayerJSX
        type={CircleLayer}
        providerRef={circleProvider}
        config={{
          animate: {
            center: AutoEasingMethod.easeInOutCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
