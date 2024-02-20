import React from "react";
import {
  add2,
  AutoEasingMethod,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  normalize2,
  onAnimationLoop,
  onFrame,
  PromiseResolver,
  scale2,
  stopAnimationLoop,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
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
      circleProvider.current.add(
        new CircleInstance({
          center: [size.mid[0], size.mid[1]],
          radius: 40,
          color: [0, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 1],
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

export const StarField: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 5000;
  const minRadius = 0.1;
  const maxRadius = 3;

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = circleProvider.current;
      if (!circleProvider.current || !surface || !provider) return;

      const loopId = onAnimationLoop(async (_t: number) => {
        // Declare and assign size inside the didMount function
        const size: { width: number; height: number } | null =
          surface.getViewSize("main");

        if (!size) {
          console.warn("Invalid View Size", surface);
          return;
        }

        const theCircles: CircleInstance[] = [];

        // Init
        for (let i = 0; i < 10; i++) {
          const x = size.width / 2;
          const y = size.height / 2;

          const circle = provider.add(
            new CircleInstance({
              center: [x, y],
              radius: minRadius,
              color: [1, 1, 1, 1],
            })
          );

          theCircles.push(circle);
        }

        // Move to destination and adjust size based on distance from the center
        onFrame(() => {
          const offscreen = Math.max(size.width, size.height);
          theCircles.forEach((c) => {
            // Move the circle to the destination
            const dir = normalize2([Math.random() - 0.5, Math.random() - 0.5]);
            c.center = add2(c.center, scale2(dir, offscreen));
            c.radius = maxRadius;
          });
        }, 1);

        // Clean up
        onFrame(() => {
          theCircles.forEach((c) => provider.remove(c));
        }, animationDuration);
      });

      return () => {
        // Remove instances when the component unmounts
        stopAnimationLoop(loopId);
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
            center: AutoEasingMethod.easeInCubic(animationDuration),
            radius: AutoEasingMethod.easeInQuart(animationDuration),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
