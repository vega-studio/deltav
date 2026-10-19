import React from "react";

import {
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { random, type RGBA01, useStressLoop } from "./stress-loop.js";

interface IEdge {
  start: [number, number];
  end: [number, number];
  control: [number, number];
  thickness: number;
  color: RGBA01;
}

export interface IEdgesFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Load bezier edges inside LOAD_AREA */
  count: number;
  seed: number;
  color: RGBA01;
  /** The sentinel edge, drawn by its own layer on top */
  sentinel: IEdge;
  frames: number;
}

function edge(e: IEdge) {
  return new EdgeInstance({
    start: e.start,
    end: e.end,
    control: [e.control, e.control],
    thickness: [e.thickness, e.thickness],
    startColor: e.color,
    endColor: e.color,
  });
}

/** Stress: `count` quadratic bezier edges in one EdgeLayer, plus a sentinel. */
const EdgesFixture: React.FC<IEdgesFixture> = (props) => {
  const { onSurface } = useStressLoop({ scenario: "edges", frames: props.frames });
  const load = React.useRef<InstanceProvider<EdgeInstance> | null>(null);
  const sentinel = React.useRef<InstanceProvider<EdgeInstance> | null>(null);

  if (!load.current) {
    const r = random(props.seed);
    const point = (): [number, number] => [
      LOAD_AREA.x + 4 + r() * (LOAD_AREA.width - 8),
      LOAD_AREA.y + 4 + r() * (LOAD_AREA.height - 8),
    ];
    load.current = new InstanceProvider<EdgeInstance>();
    for (let i = 0; i < props.count; ++i) {
      // Start, end and control inside the area keep the whole curve inside it
      // (a quadratic bezier lies in the hull of its three points).
      load.current.add(
        edge({
          start: point(),
          end: point(),
          control: point(),
          thickness: 1 + r() * 2,
          color: props.color,
        })
      );
    }
    sentinel.current = new InstanceProvider<EdgeInstance>();
    sentinel.current.add(edge(props.sentinel));
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
      <LayerJSX
        name="load"
        type={EdgeLayer}
        providerRef={load}
        config={{ type: EdgeType.BEZIER }}
      />
      <LayerJSX
        name="sentinel"
        type={EdgeLayer}
        providerRef={sentinel}
        config={{ type: EdgeType.BEZIER }}
      />
    </TestSurface>
  );
};

registerFixture("stress/edges", EdgesFixture);
