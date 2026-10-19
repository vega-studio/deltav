import React from "react";

import { RingInstance, RingLayer } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** A ring: world-space centre, outer radius and stroke thickness in pixels. */
export interface RingSpec {
  center: [number, number];
  radius: number;
  thickness: number;
  color: RGBA01;
}

export const ringKind: LayerKind<RingInstance, RingSpec> = {
  type: RingLayer,
  create: (spec) => new RingInstance(spec),
  update: (instance, spec) => assignSpec(instance, spec),
};

const RingFixture: React.FC<IScene2DProps<RingSpec>> = (props) => (
  <Scene2D {...props} kind={ringKind} />
);

registerFixture("2d/ring", RingFixture);
