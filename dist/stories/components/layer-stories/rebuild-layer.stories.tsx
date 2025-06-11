import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import {
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  CommandsJSX,
  DrawJSX,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  LayerJSX,
  PickType,
  PromiseResolver,
  SceneJSX,
  Simple3DTransformControllerJSX,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  Transform,
  type Vec3,
  View2D,
  ViewJSX,
} from "../../../src";
import { SimpleMeshInstance } from "../layers/simple-mesh/simple-mesh-instance.js";
import { SimpleMeshLayer } from "../layers/simple-mesh/simple-mesh-layer.js";

export default {
  title: "Deltav/Layers/Uses",
  args: {},
  argTypes: {},
};

const FRT: Vec3 = [1, 1, 1];
const BRT: Vec3 = [1, 1, -1];
const BRB: Vec3 = [1, -1, -1];
const FRB: Vec3 = [1, -1, 1];

const FLT: Vec3 = [-1, 1, 1];
const BLT: Vec3 = [-1, 1, -1];
const BLB: Vec3 = [-1, -1, -1];
const FLB: Vec3 = [-1, -1, 1];

const cubeVertices: Vec3[] = [
  // right
  FRT,
  BRT,
  BRB,
  FRT,
  BRB,
  FRB,
  // front
  FLT,
  FRT,
  FRB,
  FLT,
  FRB,
  FLB,
  // left
  FLT,
  BLB,
  BLT,
  FLT,
  FLB,
  BLB,
  // back
  BLT,
  BRB,
  BRT,
  BLT,
  BLB,
  BRB,
  // up
  FLT,
  BRT,
  FRT,
  FLT,
  BLT,
  BRT,
  // down
  FLB,
  FRB,
  BRB,
  FLB,
  BRB,
  BLB,
];

const right: Vec3 = [1, 0, 0];
const forward: Vec3 = [0, 0, 1];
const left: Vec3 = [-1, 0, 0];
const backward: Vec3 = [0, 0, -1];
const up: Vec3 = [0, 1, 0];
const down: Vec3 = [0, -1, 0];

const cubeNormals: Vec3[] = [
  right,
  right,
  right,
  right,
  right,
  right,
  forward,
  forward,
  forward,
  forward,
  forward,
  forward,
  left,
  left,
  left,
  left,
  left,
  left,
  backward,
  backward,
  backward,
  backward,
  backward,
  backward,
  up,
  up,
  up,
  up,
  up,
  up,
  down,
  down,
  down,
  down,
  down,
  down,
];

function makeSphereVertices(radius: number, segments: number) {
  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];

  function sphericalToCartesian(r: number, theta: number, phi: number): Vec3 {
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);
    return [x, y, z];
  }

  function normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  for (let i = 0; i < segments; i++) {
    const theta1 = (i * Math.PI) / segments;
    const theta2 = ((i + 1) * Math.PI) / segments;

    for (let j = 0; j < segments; j++) {
      const phi1 = (j * 2 * Math.PI) / segments;
      const phi2 = ((j + 1) * 2 * Math.PI) / segments;

      // Four points of the quad
      const p1 = sphericalToCartesian(radius, theta1, phi1);
      const p2 = sphericalToCartesian(radius, theta2, phi1);
      const p3 = sphericalToCartesian(radius, theta2, phi2);
      const p4 = sphericalToCartesian(radius, theta1, phi2);

      // First triangle (p1, p2, p3)
      vertices.push(p1, p2, p3);
      normals.push(normalize(p1), normalize(p2), normalize(p3));

      // Second triangle (p1, p3, p4)
      vertices.push(p1, p3, p4);
      normals.push(normalize(p1), normalize(p3), normalize(p4));
    }
  }

  return { vertices, normals };
}

const sphereVertices = makeSphereVertices(1, 20);

export const RebuildingLayers: StoryFn = (() => {
  const meshProvider = React.useRef<InstanceProvider<SimpleMeshInstance>>(null);
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  const instance = React.useRef<SimpleMeshInstance>(
    new SimpleMeshInstance({
      transform: new Transform().setLocalScale([100, 100, 100]),
      color: [0.5, 0.5, 0.5, 1],
    })
  );

  const [shape, setShape] = React.useState<"sphere" | "cube">("sphere");
  const [stop, setStop] = React.useState(false);

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      // Wait for the surface to establish the full pipeline
      if (!meshProvider.current) return;

      const view = surface.getViewWorldBounds("main.main");
      if (!view) return;

      // Center the camera on the origin (instead of the top left corner). This
      // makes it easier to place our 3D object.
      camera.current.control2D.setOffset([view.width / 2, view.height / 2, 0]);
      meshProvider.current.add(instance.current);

      instance.current.transform.setLocalPosition([
        view.width / 2,
        view.height / 2,
        100,
      ]);

      for (let i = 0; i < 100; i++) {
        const circle = new CircleInstance({
          center: [
            Math.random() * view.width - view.width / 2,
            Math.random() * view.height - view.height / 2,
          ],
          radius: Math.random() * 4 + 1,
          color: [1, 1, 1, 1],
        });
        circleProvider.current?.add(circle);
      }
    },
  });

  const toggleShape = () => {
    setShape((s) => (s === "sphere" ? "cube" : "sphere"));
  };

  const toggleStop = () => {
    setStop((s) => !s);
  };

  return (
    <>
      <SurfaceJSX
        ready={ready.current}
        options={{
          alpha: true,
          antialias: true,
        }}
        // frameRate={1}
        stop={stop}
      >
        <Simple3DTransformControllerJSX
          config={{ camera: camera.current, target: instance.current }}
        />
        <TextureJSX
          name="pick"
          width={TextureSize.SCREEN}
          height={TextureSize.SCREEN}
          textureSettings={{
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGBA,
            internalFormat: GLSettings.Texture.TexelDataType.RGBA,
          }}
        />
        {CommandsJSX({
          name: "decode-picking",
          callback: (surface) => {
            surface.commands.decodePicking();
          },
        })}
        <SceneJSX name="main">
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
              camera: camera.current,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            }}
            output={{
              buffers: { [FragmentOutputType.PICKING]: "pick" },
              depth: true,
            }}
          />
          <LayerJSX
            name="mesh-layer"
            type={SimpleMeshLayer}
            providerRef={meshProvider}
            config={{
              picking: PickType.SINGLE,
              ...(shape === "sphere"
                ? {
                    vertices: sphereVertices.vertices,
                    normals: sphereVertices.normals,
                  }
                : {
                    vertices: cubeVertices,
                    normals: cubeNormals,
                  }),
              onMouseOver: (e) => {
                if (e.instances.length <= 0) return;
                e.instances[0].color = [1.0, 1.0, 1.0, 1.0];
              },
              onMouseOut: (e) => {
                if (e.instances.length <= 0) return;
                e.instances[0].color = [0.5, 0.5, 0.5, 1.0];
              },
            }}
          />
          <LayerJSX
            name="circle-layer"
            type={CircleLayer}
            providerRef={circleProvider}
            config={{}}
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
      <button onClick={toggleShape}>Rebuild Layer Geometry</button>
      <button onClick={toggleStop}>Stop Rendering</button>
    </>
  );
}).bind({});
