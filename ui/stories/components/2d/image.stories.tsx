import pic from "./demo-pic.png";
import React from "react";
import {
  AnchorType,
  Camera2D,
  ClearFlags,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  ScaleMode,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src";
import { AtlasJSX } from "../../../src/base-surfaces/react-surface/resource/atlas-jsx";
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
          depth: 0,
          // source: pic,
          source: "https://picsum.photos/200/300",
          width: 463,
          height: 491,
          tint: [1, 1, 1, 1],
          scaling: ScaleMode.ALWAYS,
        })
      );
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
      <AtlasJSX name="atlas" width={4096} height={4096} />
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
