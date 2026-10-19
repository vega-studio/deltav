import React from "react";

import {
  AnchorType,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** A top-left-anchored rectangle, world units. */
export interface RectSpec {
  position: [number, number];
  size: [number, number];
  color: RGBA01;
  depth?: number;
}

/**
 * Rectangles anchored top-left with ScaleMode.ALWAYS, so the camera scale
 * applies to them like to any world-space shape (the default BOUND_MAX would
 * stop them growing past their nominal size).
 */
export const rectangleKind: LayerKind<RectangleInstance, RectSpec> = {
  type: RectangleLayer,
  create: (spec) =>
    new RectangleInstance({
      ...spec,
      anchor: { type: AnchorType.TopLeft, padding: 0 },
      scaling: ScaleMode.ALWAYS,
    }),
  update: (instance, spec) => assignSpec(instance, spec),
};

const RectangleFixture: React.FC<IScene2DProps<RectSpec>> = (props) => (
  <Scene2D {...props} kind={rectangleKind} />
);

registerFixture("2d/rectangle", RectangleFixture);
