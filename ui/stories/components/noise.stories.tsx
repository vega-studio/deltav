import React from "react";
import {
  CircleInstance,
  DrawJSX,
  GLSettings,
  InstanceProvider,
  PromiseResolver,
  SimplexNoiseJSX,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
} from "../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../util/hooks/use-life-cycle";

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
        output: "simplex",
        scale: [200, 200],
      })}
      {DrawJSX({
        input: "simplex",
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
      <TextureJSX
        name="blur"
        width={TextureSize.SCREEN_QUARTER}
        height={TextureSize.SCREEN_QUARTER}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB,
        }}
      />
      {SimplexNoiseJSX({
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
        input: "simplex",
      })}
    </SurfaceJSX>
  );
}).bind({});
