import React from "react";
import {
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  CommandsJSX,
  DrawJSX,
  FragmentOutputType,
  GLSettings,
  IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  PickType,
  PromiseResolver,
  SceneJSX,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  View2D,
  ViewJSX,
} from "../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../util/hooks/use-life-cycle";

export default {
  title: "Deltav/Interactions",
  args: {},
  argTypes: {},
};

export const Simple_Event_Handler: StoryFn = (() => {
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

export const Color_Picking: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("render.main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 10000; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [Math.random() * size.width, Math.random() * size.height],
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
      <BasicCamera2DControllerJSX
        config={{
          camera: camera.current,
          startView: "render.main",
          ignoreCoverViews: true,
        }}
      />
      {CommandsJSX({
        name: "decode-picking",
        callback: (surface) => {
          surface.commands.decodePicking();
        },
      })}
      <TextureJSX
        name="pick"
        width={TextureSize.SCREEN_QUARTER}
        height={TextureSize.SCREEN_QUARTER}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <SceneJSX name="render">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <ViewJSX
          name="pick-view"
          type={View2D}
          config={{
            screenScale: [4, 4],
            pixelRatio: 0.5,
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: { [FragmentOutputType.PICKING]: "pick" },
            depth: true,
          }}
        />
        <LayerJSX
          type={CircleLayer}
          providerRef={circleProvider}
          config={{
            picking: PickType.SINGLE,
            animate: {
              center: AutoEasingMethod.easeInOutCubic(2000),
              radius: AutoEasingMethod.easeOutCubic(200),
            },
            onMouseOver: (info) => {
              info.instances.forEach((i) => (i.radius = 50));
            },

            onMouseOut: (info) => {
              info.instances.forEach((i) => (i.radius = 5));
            },
          }}
        />
      </SceneJSX>
      {DrawJSX({
        name: "render-pick",
        input: "pick",
        view: {
          config: {
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            viewport: { right: 10, bottom: 10, width: "30%", height: "30%" },
          },
        },
      })}
    </SurfaceJSX>
  );
}).bind({});
