import React from "react";

import { CircleInstance, CircleLayer } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** A circle, world units. Layer config `usePoints` selects the POINTS variant. */
export interface CircleSpec {
  center: [number, number];
  radius: number;
  color: RGBA01;
}

export const circleKind: LayerKind<CircleInstance, CircleSpec> = {
  type: CircleLayer,
  create: (spec) => new CircleInstance(spec),
  update: (instance, spec) => assignSpec(instance, spec),
};

const CircleFixture: React.FC<IScene2DProps<CircleSpec>> = (props) => (
  <Scene2D {...props} kind={circleKind} />
);

registerFixture("2d/circle", CircleFixture);
