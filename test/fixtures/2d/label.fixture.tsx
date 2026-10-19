import React from "react";

import {
  AnchorType,
  LabelInstance,
  LabelLayer,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { fontResource } from "./font.js";
import {
  assignSpec,
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  report2D,
  Scene2D,
} from "./scene.js";

/** A single-line label anchored top-left, world units. */
export interface LabelSpec {
  origin: [number, number];
  text: string;
  fontSize: number;
  color: RGBA01;
}

/**
 * Labels. Each label publishes its laid-out `size` (deltav's bounding box of
 * the text) through report2D once ready.
 */
export const labelKind: LayerKind<LabelInstance, LabelSpec> = {
  type: LabelLayer,
  create: (spec, layer, index) =>
    new LabelInstance({
      ...spec,
      anchor: { type: AnchorType.TopLeft, padding: 0 },
      onReady: (label) =>
        report2D(layer, index, { size: [...label.size], origin: [...label.origin] }),
    }),
  update: (instance, spec) => assignSpec(instance, spec),
  config: (config) => ({ resourceKey: "font", ...config }),
  resources: fontResource,
};

const LabelFixture: React.FC<IScene2DProps<LabelSpec>> = (props) => (
  <Scene2D {...props} kind={labelKind} />
);

registerFixture("2d/label", LabelFixture);
