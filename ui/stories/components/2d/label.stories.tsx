import React from "react";
import RedHatDisplayTTF from "../../assets/fonts/RedHatDisplay-Regular.ttf";
import {
  AnchorType,
  BasicCamera2DControllerJSX,
  Camera2D,
  ClearFlags,
  FontJSX, // Import FontJSX
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
  const camera = React.useRef(new Camera2D());

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
            type: AnchorType.Middle,
            padding: 0,
          },
          color: [1, 1, 1, 1],
          depth: 0,
          text: "Basic Text",
          fontSize: 32,
          scale: ScaleMode.ALWAYS,
          origin: [size.width / 2, size.height / 2],
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
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <TextureJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <FontJSX
        name="font"
        dynamic={true}
        fontSource={{
          family: "RedHatDisplay",
          errorGlyph: "?",
          size: 64,
          weight: "normal",
          embed: [
            {
              familyName: "RedHatDisplay",
              fontType: "truetype",
              source: RedHatDisplayTTF,
              weight: 400,
              style: "normal",
            },
          ],
        }}
      />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        type={LabelLayer}
        providerRef={labelProvider}
        config={{
          resourceKey: "font",
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
