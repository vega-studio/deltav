import React from "react";
import {
  AnchorType,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  RectangleInstance,
  RectangleLayer,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/2D/Rectangle",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const rectangleProvider =
    React.useRef<InstanceProvider<RectangleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!rectangleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      // Add a single RectangleInstance
      rectangleProvider.current.add(
        new RectangleInstance({
          anchor: {
            type: AnchorType.Middle,
            padding: 0,
          },
          position: [size.mid[0] - 60, size.mid[1]],
          size: [100, 100],
          color: [0, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 1],
        })
      );

      rectangleProvider.current.add(
        new RectangleInstance({
          anchor: {
            type: AnchorType.Middle,
            padding: 0,
          },
          position: [size.mid[0] + 60, size.mid[1]],
          size: [100, 100],
          color: [0, 0, 0, 0],
          outline: 4,
          outlineColor: [
            0,
            Math.random() * 0.8 + 0.2,
            Math.random() * 0.8 + 0.2,
            1,
          ],
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
        type={RectangleLayer}
        providerRef={rectangleProvider}
        config={{}}
      />
    </SurfaceJSX>
  );
}).bind({});
