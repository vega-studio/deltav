import React from "react";

import {
  AnchorType,
  AtlasJSX,
  ImageInstance,
  ImageLayer,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/**
 * An image anchored top-left, world units. Its source is generated in the
 * page: a `texels`×`texels` canvas split into four solid quadrants, top-left,
 * top-right, bottom-left, bottom-right, passed to the atlas as a PNG data URL.
 */
export interface ImageSpec {
  origin: [number, number];
  width: number;
  height: number;
  quadrants: [RGBA01, RGBA01, RGBA01, RGBA01];
  texels?: number;
}

function quadrantDataURL(quadrants: ImageSpec["quadrants"], texels: number) {
  const canvas = document.createElement("canvas");
  canvas.width = texels;
  canvas.height = texels;
  const ctx = canvas.getContext("2d")!;
  const h = texels / 2;
  const corners: [number, number][] = [
    [0, 0],
    [h, 0],
    [0, h],
    [h, h],
  ];
  quadrants.forEach((color, i) => {
    const [r, g, b] = color.map((c) => Math.round(c * 255));
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${color[3]})`;
    ctx.fillRect(corners[i][0], corners[i][1], h, h);
  });
  return canvas.toDataURL("image/png");
}

export const imageKind: LayerKind<ImageInstance, ImageSpec> = {
  type: ImageLayer,
  create: (spec) =>
    new ImageInstance({
      anchor: { type: AnchorType.TopLeft, padding: 0 },
      origin: spec.origin,
      width: spec.width,
      height: spec.height,
      tint: [1, 1, 1, 1],
      source: quadrantDataURL(spec.quadrants, spec.texels ?? 32),
    }),
  update: (instance, spec) => {
    instance.origin = spec.origin;
    instance.width = spec.width;
    instance.height = spec.height;
  },
  config: (config) => ({ atlas: "atlas", ...config }),
  resources: <AtlasJSX name="atlas" width={256} height={256} />,
};

const ImageFixture: React.FC<IScene2DProps<ImageSpec>> = (props) => (
  <Scene2D {...props} kind={imageKind} />
);

registerFixture("2d/image", ImageFixture);
