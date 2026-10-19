import React from "react";

import { EdgeInstance, EdgeLayer, EdgeType } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** An edge, world units; `control` holds the Bézier control point(s). */
export interface EdgeSpec {
  start: [number, number];
  end: [number, number];
  control?: [number, number][];
  thickness: [number, number];
  startColor: RGBA01;
  endColor: RGBA01;
}

/**
 * Edges. The layer config takes `edgeType` as an EdgeType member name
 * ("LINE", "BEZIER", …), since a node-side test cannot import the enum.
 */
export const edgeKind: LayerKind<EdgeInstance, EdgeSpec> = {
  type: EdgeLayer,
  create: (spec) => new EdgeInstance(spec),
  update: (instance, spec) => assignSpec(instance, spec),
  config: ({ edgeType = "LINE", ...rest }) => ({
    ...rest,
    type: EdgeType[edgeType as keyof typeof EdgeType],
  }),
};

const EdgeFixture: React.FC<IScene2DProps<EdgeSpec>> = (props) => (
  <Scene2D {...props} kind={edgeKind} />
);

registerFixture("2d/edge", EdgeFixture);
