import React from "react";
import { StoryFn } from "@storybook/react";
import { SurfaceJSX } from "../../../src/base-surfaces/react-surface/surface-jsx";
import {
  AutoEasingMethod,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  InstanceProvider,
  PromiseResolver,
  Surface,
  View2D,
} from "../../../src";
import { LayerJSX } from "../../../src/base-surfaces/react-surface/scene/layer-jsx";
import { ViewJSX } from "../../../src/base-surfaces/react-surface/scene/view-jsx";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/Circle",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
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

      // Add a single CircleInstance
      const circleInstance = circleProvider.current.add(
        new CircleInstance({
          center: [size.mid[0], size.mid[1]],
          radius: Math.random() * 5 + 2,
          color: [
            0,
            Math.random() * 0.8 + 0.2,
            Math.random() * 0.8 + 0.2,
            1,
          ],
        })
      );

      return () => {
        // Remove the single CircleInstance when the component unmounts
        circleProvider.current?.remove(circleInstance);
      };
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
