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

export interface IRectFixture {
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
 * deltav control: one RectangleLayer instance, anchored top-left, in a View2D
 * with an identity Camera2D. Its pixels are world coordinates one to one.
 */
const RectFixture: React.FC<IRectFixture> = (props) => {
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

registerFixture("control/rect", RectFixture);
