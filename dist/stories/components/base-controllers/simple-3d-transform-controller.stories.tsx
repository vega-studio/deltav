import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import {
  Camera,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  Simple3DTransformControllerJSX,
  Surface,
  SurfaceJSX,
  Transform,
  View3D,
  ViewJSX,
} from "../../../src/index.js";
import { CubeInstance } from "../layers/cube/cube-instance.js";
import { CubeLayer } from "../layers/cube/cube-layer.js";

export default {
  title: "Deltav/EventHandling/BaseControllers",
  args: {},
  argTypes: {},
};

export const Simple_3D_Transform_Controller: StoryFn = (() => {
  const cubeProvider = React.useRef<InstanceProvider<CubeInstance>>(null);
  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      near: 0.1,
      far: 10000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());
  const instance = React.useRef<CubeInstance>(
    new CubeInstance({
      transform: new Transform(),
      color: [
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        1,
      ],
      glow: [1, 1, 1, 1],
      size: [10, 10, 10],
    })
  );

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      await ready.current.promise;
      if (!cubeProvider.current) return;

      cubeProvider.current.add(instance.current);

      camera.current.position = [0, 0, 100];
      camera.current.lookAt([0, 0, 0], [0, 1, 0]);

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
      <Simple3DTransformControllerJSX
        config={{ camera: camera.current, target: instance.current }}
      />
      <ViewJSX
        name="main"
        type={View3D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX type={CubeLayer} providerRef={cubeProvider} config={{}} />
    </SurfaceJSX>
  );
}).bind({});
