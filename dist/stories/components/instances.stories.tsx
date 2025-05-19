import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  nextFrame,
  PromiseResolver,
  SceneJSX,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../src";
import { VertexPackingCircleInstance } from "./layers/vertex-packing-circle/vertex-packing-circle-instance.js";
import { VertexPackingCircleLayer } from "./layers/vertex-packing-circle/vertex-packing-circle-layer.js";

export default {
  title: "Deltav/Instances",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
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

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
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

export const With_Mouse_Interactions: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
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

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
    },
  });

  const handleMouseDown = (e: IMouseInteraction) => {
    if (!circles.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);

    circles.current.forEach((circle) => {
      circle.center = [
        Math.random() * 400 - 200 + world[0],
        Math.random() * 400 - 200 + world[1],
      ];
    });
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
      <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
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

export const With_Scenes: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main-scene.main-view");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
    },
  });

  const handleMouseDown = (e: IMouseInteraction) => {
    if (!circles.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);

    circles.current.forEach((circle) => {
      circle.center = [
        Math.random() * 400 - 200 + world[0],
        Math.random() * 400 - 200 + world[1],
      ];
    });
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
      <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
      <SceneJSX name="main-scene">
        <ViewJSX
          name="main-view"
          type={View2D}
          config={{
            camera: camera.current,
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
      </SceneJSX>
    </SurfaceJSX>
  );
}).bind({});

export const Auto_Vertex_Packing: StoryFn = (() => {
  const circleProvider =
    React.useRef<InstanceProvider<VertexPackingCircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
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

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new VertexPackingCircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
              color2: [
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                0,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
    },
  });

  const handleMouseDown = (e: IMouseInteraction) => {
    if (!circles.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);

    circles.current.forEach((circle) => {
      circle.center = [
        Math.random() * 400 - 200 + world[0],
        Math.random() * 400 - 200 + world[1],
      ];
    });
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
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
        type={VertexPackingCircleLayer}
        providerRef={circleProvider}
        config={{
          printShader: true,
        }}
      />
    </SurfaceJSX>
  );
}).bind({});

export const Large_Interaction_Count: StoryFn = (() => {
  const total = 500000;
  const pauses = 10;
  const circleProvider = new Array(1)
    .fill(0)
    .map(() => React.useRef<InstanceProvider<CircleInstance>>(null));
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;

      for (const provider of circleProvider) {
        if (!provider.current) return;

        const size = surface.getViewSize("main");
        if (!size) {
          console.warn("Invalid View Size", surface);
          return;
        }

        const instances: CircleInstance[] = [];
        const pauseAt = Math.floor(total / circleProvider.length / pauses);

        for (let i = 0, iMax = total / circleProvider.length; i < iMax; ++i) {
          instances.push(
            provider.current.add(
              new CircleInstance({
                center: [
                  Math.random() * size.width,
                  Math.random() * size.height,
                ],
                radius: 0.5,
                color: [
                  0,
                  Math.random() * 0.8 + 0.2,
                  Math.random() * 0.8 + 0.2,
                  1,
                ],
              })
            )
          );

          if (i % pauseAt === 0) await nextFrame();
        }

        await nextFrame();
        circles.current = instances;
      }

      return () => {};
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
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      {circleProvider.map((provider, i) => (
        <LayerJSX
          key={i}
          type={CircleLayer}
          providerRef={provider}
          config={{
            // bufferManagement: {
            //   instancing: false,
            //   baseBufferGrowthRate: 0,
            // },
            animate: {
              center: AutoEasingMethod.easeInOutCubic(2000),
            },
            // bufferManagement: {
            //   optimize: {
            //     expectedInstanceCount: Math.ceil(total / circleProvider.length),
            //   },
            // },
          }}
        />
      ))}
    </SurfaceJSX>
  );
}).bind({});
