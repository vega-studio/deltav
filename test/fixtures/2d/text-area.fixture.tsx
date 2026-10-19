import React from "react";

import {
  AnchorType,
  ScaleMode,
  TextAreaInstance,
  TextAreaLayer,
  WordWrap,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { fontResource } from "./font.js";
import {
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  report2D,
  Scene2D,
} from "./scene.js";

/** A text area anchored top-left, world units, word-wrapped. */
export interface TextAreaSpec {
  origin: [number, number];
  text: string;
  fontSize: number;
  color: RGBA01;
  maxWidth: number;
  maxHeight: number;
  lineHeight: number;
  hasBorder: boolean;
  borderWidth?: number;
}

/**
 * Text areas with ScaleMode.ALWAYS (world space). Each one reports `ready`
 * through report2D once all its word labels are ready.
 */
export const textAreaKind: LayerKind<TextAreaInstance, TextAreaSpec> = {
  type: TextAreaLayer,
  create: (spec, layer, index) =>
    new TextAreaInstance({
      ...spec,
      anchor: { type: AnchorType.TopLeft, padding: 0 },
      wordWrap: WordWrap.WORD,
      onReady: () => report2D(layer, index, { ready: true }),
    }),
  update: () => undefined,
  config: (config) => ({
    resourceKey: "font",
    scaling: ScaleMode.ALWAYS,
    ...config,
  }),
  resources: fontResource,
};

const TextAreaFixture: React.FC<IScene2DProps<TextAreaSpec>> = (props) => (
  <Scene2D {...props} kind={textAreaKind} />
);

registerFixture("2d/text-area", TextAreaFixture);
