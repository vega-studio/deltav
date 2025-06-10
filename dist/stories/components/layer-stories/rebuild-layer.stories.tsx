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
  type Vec3,
  View3D,
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
  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      near: 0.1,
      far: 10000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());

  const instance = React.useRef<SimpleMeshInstance>(
    new SimpleMeshInstance({
      transform: new Transform(),
      color: [0.5, 0.5, 0.5, 1],
    })
  );

  const [shape, setShape] = React.useState<"sphere" | "cube">("sphere");

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!meshProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      camera.current.position = [0, 0, 20];
      camera.current.lookAt([0, 0, 0], [0, 1, 0]);

      // Add a single CircleInstance
      meshProvider.current.add(instance.current);
    },
  });

  const toggleShape = () => {
    setShape((s) => (s === "sphere" ? "cube" : "sphere"));
  };

  return (
    <>
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
        <LayerJSX
          type={SimpleMeshLayer}
          providerRef={meshProvider}
          config={
            shape === "sphere"
              ? {
                  vertices: sphereVertices.vertices,
                  normals: sphereVertices.normals,
                }
              : {
                  vertices: cubeVertices,
                  normals: cubeNormals,
                }
          }
        />
      </SurfaceJSX>
      <button onClick={toggleShape}>Clicky</button>
    </>
  );
}).bind({});
