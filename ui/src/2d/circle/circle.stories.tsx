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
  onAnimationLoop,
} from "../../../src";
import { LayerJSX } from "../../../src/base-surfaces/react-surface/scene/layer-jsx";
import { ViewJSX } from "../../../src/base-surfaces/react-surface/scene/view-jsx";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/2D/Circle",
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
          radius: 40,
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
          // Animation for center property using easing method over 2000 milliseconds
          animate: {
            center: AutoEasingMethod.easeInOutCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});

export const Advanced: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];
      const numCircles = 100;
      const spiralRadius = 2;
      const spiralSpacing = 4;

      // Create instances of CircleInstance in a spiral pattern
      for (let i = 0; i < numCircles; i++) {
        const angle = (i / numCircles) * Math.PI * 10;
        const radius = spiralRadius + i * spiralSpacing;

        const circleInstance = circleProvider.current.add(
          new CircleInstance({
            center: [
              size.mid[0] + radius * Math.cos(angle),
              size.mid[1] + radius * Math.sin(angle),
            ],
            radius: 8,
            color: [
              Math.random(),
              Math.random(),
              Math.random(),
              1,
            ],
          })
        );

        instances.push(circleInstance);
      }

      // Use onAnimationLoop to continuously update center and radius properties
      onAnimationLoop(() => {
        instances.forEach((circleInstance) => {
          // Randomly move the center and change the radius
          circleInstance.center = [
            circleInstance.center[0] + Math.random() * 2 - 1,
            circleInstance.center[1] + Math.random() * 2 - 1,
          ];
          circleInstance.radius = Math.random() * 4 + 6;
        });
      });

      return () => {
        // Remove instances when the component unmounts
        instances.forEach((circleInstance) => {
          circleProvider.current?.remove(circleInstance);
        });
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
          // No additional configuration for this layer
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
