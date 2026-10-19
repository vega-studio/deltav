import React from "react";

import {
  AnchorType,
  CircleInstance,
  CircleLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface IRemountFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Instances per layer (rects, circles, edges) in LOAD_AREA */
  perLayer: number;
  seed: number;
  color: RGBA01;
  /** The sentinel rect, top-left anchored, in its own layer */
  sentinel: { position: [number, number]; size: [number, number]; color: RGBA01 };
}

/** Stress: a mid-size scene (three load layers and a sentinel) to remount over and over. */
const RemountFixture: React.FC<IRemountFixture> = (props) => {
  const { onSurface } = useStressLoop({ scenario: "remount", frames: 0 });
  const rects = React.useRef<InstanceProvider<RectangleInstance> | null>(null);
  const circles = React.useRef<InstanceProvider<CircleInstance> | null>(null);
  const edges = React.useRef<InstanceProvider<EdgeInstance> | null>(null);
  const sentinel = React.useRef<InstanceProvider<RectangleInstance> | null>(null);

  if (!rects.current) {
    const r = random(props.seed);
    const point = (pad: number): [number, number] => [
      LOAD_AREA.x + pad + r() * (LOAD_AREA.width - 2 * pad),
      LOAD_AREA.y + pad + r() * (LOAD_AREA.height - 2 * pad),
    ];
    rects.current = new InstanceProvider<RectangleInstance>();
    circles.current = new InstanceProvider<CircleInstance>();
    edges.current = new InstanceProvider<EdgeInstance>();
    for (let i = 0; i < props.perLayer; ++i) {
      rects.current.add(
        new RectangleInstance({
          anchor: { type: AnchorType.TopLeft, padding: 0 },
          position: point(12),
          size: [8, 8],
          color: props.color,
        })
      );
      circles.current.add(
        new CircleInstance({ center: point(6), radius: 4, color: props.color })
      );
      edges.current.add(
        new EdgeInstance({
          start: point(4),
          end: point(4),
          control: [point(4), point(4)],
          thickness: [2, 2],
          startColor: props.color,
          endColor: props.color,
        })
      );
    }
    sentinel.current = new InstanceProvider<RectangleInstance>();
    sentinel.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: props.sentinel.position,
        size: props.sentinel.size,
        color: props.sentinel.color,
      })
    );
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
      <LayerJSX name="rects" type={RectangleLayer} providerRef={rects} config={{}} />
      <LayerJSX name="circles" type={CircleLayer} providerRef={circles} config={{}} />
      <LayerJSX
        name="edges"
        type={EdgeLayer}
        providerRef={edges}
        config={{ type: EdgeType.BEZIER }}
      />
      <LayerJSX
        name="sentinel"
        type={RectangleLayer}
        providerRef={sentinel}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("stress/remount", RemountFixture);
