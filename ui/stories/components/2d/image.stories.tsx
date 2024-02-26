import React from "react";
import {
  AnchorType,
  Camera2D,
  ClearFlags,
  GLSettings,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  ScaleMode,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/2D/Image",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const imageProvider = React.useRef<InstanceProvider<ImageInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = imageProvider.current;
      if (!imageProvider.current || !surface || !provider) return;

      // Declare and assign size inside the didMount function
      const size: { width: number; height: number } | null =
        surface.getViewSize("main");

      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }
      provider.add(
        new ImageInstance({
          anchor: {
            x: size.width / 2,
            y: size.height / 2,
            padding: 10,
            type: AnchorType.Custom,
          },
          depth: 0,
          source: "https://picsum.photos/200/300",
          width: 200,
          height: 300,
          tint: [1, 1, 1, 1],
          scaling: ScaleMode.ALWAYS,
        })
      );
    },
  });

  const textureSettings = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <TextureJSX
        name="atlas"
        width={4096}
        height={4096}
        textureSettings={textureSettings}
      />
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
        type={ImageLayer}
        providerRef={imageProvider}
        config={{
          atlas: "atlas",
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
