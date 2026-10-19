import React from "react";

import { ArcInstance, ArcLayer } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** An arc, world units; `angle` is [start, end] in radians. */
export interface ArcSpec {
  center: [number, number];
  radius: number;
  angle: [number, number];
  thickness: [number, number];
  colorStart: RGBA01;
  colorEnd: RGBA01;
}

export const arcKind: LayerKind<ArcInstance, ArcSpec> = {
  type: ArcLayer,
  create: (spec) => new ArcInstance(spec),
  update: (instance, spec) => assignSpec(instance, spec),
};

const ArcFixture: React.FC<IScene2DProps<ArcSpec>> = (props) => (
  <Scene2D {...props} kind={arcKind} />
);

registerFixture("2d/arc", ArcFixture);
