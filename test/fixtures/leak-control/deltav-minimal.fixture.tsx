import React from "react";

import {
  AnchorType,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";

export interface IDeltavMinimalFixture {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: [number, number, number, number];
  /** Top-left corner of the rectangle, world units */
  position: [number, number];
  /** Size of the rectangle, world units */
  size: [number, number];
  /** Rectangle colour, 0–1 RGBA */
  color: [number, number, number, number];
}

/**
 * The leak detector's real target: a SurfaceJSX with one View2D and one
 * RectangleLayer holding one top-left-anchored instance.
 */
const DeltavMinimalFixture: React.FC<IDeltavMinimalFixture> = (props) => {
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: props.position,
        size: props.size,
        color: props.color,
      })
    );
  }
  const camera = React.useRef(new Camera2D());

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: props.clear,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        name="rect"
        type={RectangleLayer}
        providerRef={provider}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("leak-control/deltav-minimal", DeltavMinimalFixture);
