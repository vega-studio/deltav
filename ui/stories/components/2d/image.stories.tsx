import React from "react";
import { AtlasJSX } from "../../../src/base-surfaces/react-surface/resource/atlas-jsx";
import {
  BasicCamera2DControllerJSX,
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
  const camera = React.useRef(new Camera2D());

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

      const ids = new Array(20).fill(0).map((_, i) => i);

      for (let i = 0; i < 200; i++) {
        for (let k = 0; k < 100; k++) {
          provider.add(
            new ImageInstance({
              depth: 0,
              // source: pic,
              source: `https://picsum.photos/200/300?rand=${
                ids[Math.floor(Math.random() * ids.length)]
              }`,
              width: 50,
              height: 50,
              origin: [i * 50, k * 50],
              tint: [1, 1, 1, 1],
              scaling: ScaleMode.ALWAYS,
            })
          );
        }
      }
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
      <BasicCamera2DControllerJSX options={{ camera: camera.current }} />
      <AtlasJSX name="atlas" width={4096} height={4096} />
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
        type={ImageLayer}
        providerRef={imageProvider}
        config={{
          atlas: "atlas",
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
