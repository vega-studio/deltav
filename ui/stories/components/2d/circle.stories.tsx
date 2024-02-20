import React from "react";
import {
  AutoEasingMethod,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
  add2,
  normalize2,
  onAnimationLoop,
  onFrame,
  scale2,
  stopAnimationLoop,
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
      const circleInstance = circleProvider.current.add(
        new CircleInstance({
          center: [size.mid[0], size.mid[1]],
          radius: 40,
          color: [0, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 1],
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


export const StarField: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 4000;
  const minRadius = 0;
  const maxRadius = 3;

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      if (!circleProvider.current || !surface) return;

      // Declare and assign size inside the didMount function
      const size: { width: number; height: number } | null = surface.getViewSize("main");
      if (!size || !size.width || !size.height) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const loopId = onAnimationLoop((_t: number) => {
        const theCircles: CircleInstance[] = [];

        // Init
        for (let i = 0; i < 10; i++) {
          if (circleProvider.current && size) {
            const x = size.width / 2 + Math.random() * 1;
            const y = size.height / 2 + Math.random() * 1;

            const circle = circleProvider.current.add(
              new CircleInstance({
                center: [x, y],
                radius: minRadius,
                color: [1, 1, 1, 1],
              })
            );

            theCircles.push(circle);
          }
        }

        // Move to destination and adjust size based on distance from the center
        onFrame(() => {
          theCircles.forEach((c) => {
              // Move the circle to the destination
              const dir = normalize2([Math.random() - 0.5, Math.random() - 0.5]);
              c.center = add2(c.center, scale2(dir, Math.random() * 350 + 100));
              c.radius = maxRadius;
          });
      }, 1);

        // Clean up
        onFrame(() => {
          theCircles.forEach(c => circleProvider.current?.remove(c));
        }, animationDuration);
      }, 1);

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
            radius: AutoEasingMethod.easeInCubic(animationDuration),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});