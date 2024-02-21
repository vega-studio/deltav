import React from "react";
import {
  ArcInstance,
  ArcLayer,
  AutoEasingMethod,
  Camera2D,
  ClearFlags,
  EasingUtil,
  InstanceProvider,
  LayerJSX,
  onAnimationLoop,
  onFrame,
  PromiseResolver,
  stopAnimationLoop,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/2D/Arc",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const arcProvider = React.useRef<InstanceProvider<ArcInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!arcProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      // Add a single CircleInstance
      arcProvider.current.add(
        new ArcInstance({
          angle: [0, Math.PI],
          center: [size.mid[0], size.mid[1]],
          colorEnd: [1, 1, 1, 1],
          colorStart: [1, 0, 0, 1],
          depth: 0,
          radius: 100 / 4,
          thickness: [5, 5],
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
        type={ArcLayer}
        providerRef={arcProvider}
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

export const Complex: StoryFn = (() => {
  const arcProvider = React.useRef<InstanceProvider<ArcInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 4000;
  let arcCounter = 30;
  let currentIteration = 0;
  const activeArcIndex = React.useRef(0);
  let loopColor: [number, number, number, number] = [
    Math.random(),
    Math.random(),
    Math.random(),
    1,
  ];

  function getRandomColor(): [number, number, number, number] {
    return [Math.random(), Math.random(), Math.random(), 1];
  }

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = arcProvider.current;
      if (!provider || !surface) return;

      const loopId = onAnimationLoop((_t: number) => {
        const size = surface.getViewSize("main");
        if (!size) {
          console.warn("Invalid View Size", surface);
          return;
        }

        const arc = provider.add(
          new ArcInstance({
            angle: [0, 0.1],
            center: [size.width / 2, size.height / 2],
            colorStart: [0, 0, 0, 1],
            colorEnd: [0, 0, 0, 1],
            depth: 0,
            radius: 30 + currentIteration * 90,
            thickness: [5, -5],
          })
        );
        // Move only the active arc to destination and adjust size based on distance from the center
        onFrame(() => {
          if (arcCounter > 0) {
            arcCounter--;
            currentIteration++;
            arc.angle = [
              10 + currentIteration * 1,
              2 + currentIteration * 20 + 200,
            ];
            arc.colorStart = loopColor;
            arc.colorEnd = loopColor;
            arc.thickness = [-2, 2];
            arc.radius = 30 + currentIteration * 20;
            arc.depth = 1;
          }

          // Update active arc index for the next frame
          activeArcIndex.current = (activeArcIndex.current + 1) % 15;
        }, 1);

        // Clean up
        onFrame(() => {
          provider.remove(arc); // Remove the arc from the provider
          // Reset counters if all arcs are created
          if (arcCounter === 0) {
            arcCounter = 30;
            currentIteration = 0;
            loopColor = getRandomColor();
          }
        }, animationDuration);
      }, 100);

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
        type={ArcLayer}
        providerRef={arcProvider}
        config={{
          // Animation for properties using easing method over 2000 milliseconds
          animate: {
            angle: AutoEasingMethod.easeInCubic(2000),
            center: AutoEasingMethod.easeInCubic(2000),
            radius: AutoEasingMethod.easeInCubic(2000),
            thickness: AutoEasingMethod.easeInCubic(2000),
            colorEnd: AutoEasingMethod.easeInCubic(2000),
            colorStart: AutoEasingMethod.easeInCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});

export const AnotherComplex: StoryFn = (() => {
  const arcProvider = React.useRef<InstanceProvider<ArcInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 4000;
  let arcCounter = 30;
  let currentIteration = 0;
  const activeArcIndex = React.useRef(0);

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = arcProvider.current;
      if (!provider || !surface) return;

      const loopId = onAnimationLoop((_t: number) => {
        const size = surface.getViewSize("main");
        if (!size) {
          console.warn("Invalid View Size", surface);
          return;
        }

        const arc = provider.add(
          new ArcInstance({
            angle: [0, 0.1],
            center: [size.width / 2, size.height / 2],
            colorStart: [0, 0, 0, 1],
            colorEnd: [0, 0, 0, 1],
            depth: 0,
            radius: 30 + currentIteration * 90,
            thickness: [5, -5],
          })
        );
        // Move only the active arc to destination and adjust size based on distance from the center
        onFrame(() => {
          const loopColor: [number, number, number, number] = [
            Math.random(),
            Math.random(),
            Math.random(),
            1,
          ];
          if (arcCounter > 0) {
            arcCounter--;
            currentIteration++;
            arc.angle = [
              10 + currentIteration * 1,
              2 + currentIteration * 20 + 200,
            ];
            arc.colorStart = loopColor;
            arc.colorEnd = loopColor;
            arc.thickness = [-2, 2];
            arc.radius = 30 + currentIteration * 20;
            arc.depth = 1;
          }

          // Update active arc index for the next frame
          activeArcIndex.current = (activeArcIndex.current + 1) % 15;
        }, 1);

        // Clean up
        onFrame(() => {
          provider.remove(arc); // Remove the arc from the provider
          // Reset counters if all arcs are created
          if (arcCounter === 0) {
            arcCounter = 30;
            currentIteration = 0;
          }
        }, animationDuration);
      }, 100);

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
        type={ArcLayer}
        providerRef={arcProvider}
        config={{
          // Animation for properties using easing method over 2000 milliseconds
          animate: {
            angle: AutoEasingMethod.easeInCubic(2000),
            center: AutoEasingMethod.easeInCubic(2000),
            radius: AutoEasingMethod.easeInCubic(2000),
            thickness: AutoEasingMethod.easeInCubic(2000),
            colorEnd: AutoEasingMethod.easeInCubic(2000),
            colorStart: AutoEasingMethod.easeInCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
