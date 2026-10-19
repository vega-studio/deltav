import React from "react";

import { DrawJSX, TextureJSX } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { quadrantCanvas, type RGBA01, rgbaTextureSettings } from "./common.js";

export interface ITextureFilterFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Quadrant colours: top-left, top-right, bottom-left, bottom-right */
  quadrants: [RGBA01, RGBA01, RGBA01, RGBA01];
  /** Size of the quadrant texture in texels (square) */
  texels: number;
  /** Min/mag filter of the texture */
  filter: "nearest" | "linear";
}

/**
 * A TextureJSX whose data is an in-page canvas of four solid quadrants
 * (uploaded with flipY, so its top row is the texture's top), drawn over the
 * whole canvas by DrawJSX: texture coordinate (0, 0) is the canvas's
 * bottom-left corner, (1, 1) its top-right.
 */
const TextureFilterFixture: React.FC<ITextureFilterFixture> = (props) => {
  const data = React.useRef<HTMLCanvasElement | null>(null);
  if (!data.current) {
    data.current = quadrantCanvas(props.quadrants, props.texels, props.texels);
  }

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <TextureJSX
        name="quadrants"
        width={props.texels}
        height={props.texels}
        textureSettings={{
          ...rgbaTextureSettings(props.filter),
          flipY: true,
          data: data.current,
        }}
      />
      {DrawJSX({ name: "present", input: "quadrants" })}
    </TestSurface>
  );
};

registerFixture("resources/texture-filter", TextureFilterFixture);
