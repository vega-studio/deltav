import React from "react";
import {
  AnchorType,
  Camera2D,
  ClearFlags,
  GLSettings,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
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
  title: "Deltav/2D/Label",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const labelProvider = React.useRef<InstanceProvider<LabelInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = labelProvider.current;
      if (!labelProvider.current || !surface || !provider) return;

      // Declare and assign size inside the didMount function
      const size: { width: number; height: number } | null =
        surface.getViewSize("main");

      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }
      provider.add(
        new LabelInstance({
          anchor: {
            x: size.width / 2,
            y: size.height / 2,
            padding: 0,
            type: AnchorType.Custom,
          },
          color: [1, 0, 0, 1],
          depth: 0,
          text: "Hello World",
          fontSize: 20,
          origin: [0.5, 0.5],
        })
      );
    },
  });

  const textureSettings = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA,
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
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
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
      <LayerJSX type={LabelLayer} providerRef={labelProvider} />
    </SurfaceJSX>
  );
}).bind({});
