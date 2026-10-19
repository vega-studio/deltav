import React from "react";

import {
  Camera,
  ClearFlags,
  CubeInstance,
  fromEulerAxisAngleToQuat,
  InstanceProvider,
  LayerJSX,
  Transform,
  View3D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { StressCubeLayer } from "./stress-cube-layer.js";
import { random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface ICubesFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Load cubes, all children of one rotating scene-graph parent */
  count: number;
  /** Half-extent of each load cube (CubeLayer `size`), world units */
  half: number;
  /** Load cubes are spread over the annulus between these radii (z = 0) */
  innerRadius: number;
  outerRadius: number;
  /** Parent rotation about +z per frame, radians */
  step: number;
  frames: number;
  seed: number;
  /** Half-extent of the unparented sentinel cube at the origin */
  sentinelHalf: number;
}

/**
 * Stress: 3D scene graph. An orthographic View3D (camera at +z looking at the
 * origin: one world unit is one pixel and the origin is the canvas centre).
 * `count` cubes are children of one Transform rotated about the view axis
 * every frame, so every cube's world matrix changes every frame; an unparented
 * sentinel cube sits at the origin, inside the annulus' hole.
 */
const CubesFixture: React.FC<ICubesFixture> = (props) => {
  const parent = React.useRef<Transform | null>(null);
  const provider = React.useRef<InstanceProvider<CubeInstance> | null>(null);
  const camera = React.useRef<Camera | null>(null);

  if (!provider.current) {
    const r = random(props.seed);
    parent.current = new Transform();
    provider.current = new InstanceProvider<CubeInstance>();
    for (let i = 0; i < props.count; ++i) {
      const cube = new CubeInstance({
        size: [props.half, props.half, props.half],
        parent: parent.current,
      });
      const angle = r() * Math.PI * 2;
      const radius =
        props.innerRadius + r() * (props.outerRadius - props.innerRadius);
      cube.localPosition = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
      provider.current.add(cube);
    }
    const sentinel = new CubeInstance({
      size: [props.sentinelHalf, props.sentinelHalf, props.sentinelHalf],
    });
    provider.current.add(sentinel);

    camera.current = Camera.makeOrthographic();
    camera.current.position = [0, 0, 500];
    camera.current.lookAt([0, 0, 0], [0, 1, 0]);
  }

  const { onSurface } = useStressLoop({
    scenario: "cubes",
    frames: props.frames,
    onFrame(frame) {
      parent.current!.localRotation = fromEulerAxisAngleToQuat(
        [0, 0, 1],
        (frame + 1) * props.step
      );
    },
  });

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={onSurface}
    >
      <ViewJSX
        name="main"
        type={View3D}
        config={{
          camera: camera.current!,
          background: props.clear,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX name="cubes" type={StressCubeLayer} providerRef={provider} config={{}} />
    </TestSurface>
  );
};

registerFixture("stress/cubes", CubesFixture);
