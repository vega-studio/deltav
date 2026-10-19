import React from "react";

import {
  CircleInstance,
  CircleLayer,
  InstanceProvider,
  LayerJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface ICirclesFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Load circles, scattered over LOAD_AREA */
  count: number;
  seed: number;
  /** Load circle colour */
  color: RGBA01;
  /** Sentinel circles, drawn by a second layer on top */
  sentinels: { center: [number, number]; radius: number; color: RGBA01 }[];
  /** Frames sampled after ready */
  frames: number;
}

/** Stress: `count` circles in one CircleLayer, plus sentinels on top. */
const CirclesFixture: React.FC<ICirclesFixture> = (props) => {
  const { onSurface } = useStressLoop({
    scenario: "circles",
    frames: props.frames,
  });
  const load = React.useRef<InstanceProvider<CircleInstance> | null>(null);
  const sentinels = React.useRef<InstanceProvider<CircleInstance> | null>(null);

  if (!load.current) {
    const rand = random(props.seed);
    load.current = new InstanceProvider<CircleInstance>();
    for (let i = 0; i < props.count; ++i) {
      const radius = 1 + rand() * 3;
      load.current.add(
        new CircleInstance({
          center: [
            LOAD_AREA.x + radius + rand() * (LOAD_AREA.width - 2 * radius),
            LOAD_AREA.y + radius + rand() * (LOAD_AREA.height - 2 * radius),
          ],
          radius,
          color: props.color,
        })
      );
    }
    sentinels.current = new InstanceProvider<CircleInstance>();
    for (const s of props.sentinels) {
      sentinels.current.add(
        new CircleInstance({ center: s.center, radius: s.radius, color: s.color })
      );
    }
  }

  const view = useView2DConfig(props.clear);

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={onSurface}
    >
      {mainView2D(view)}
      <LayerJSX name="load" type={CircleLayer} providerRef={load} config={{}} />
      <LayerJSX
        name="sentinels"
        type={CircleLayer}
        providerRef={sentinels}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("stress/circles", CirclesFixture);
