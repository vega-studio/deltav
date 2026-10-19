import React from "react";

import { DrawJSX, SimplexNoiseJSX, TextureJSX } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type RGBA01, rgbaTextureSettings } from "./common.js";

export interface INoiseFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** SimplexNoiseJSX `scale`: the feature size in pixels */
  scale: [number, number];
  /** A fixed `zOffset` (3D noise slice); omitted draws 2D noise */
  zOffset?: number;
}

/**
 * SimplexNoiseJSX writes grayscale noise of gl_FragCoord into texture
 * "noise" (2D noise, or the `zOffset` slice of 3D noise); DrawJSX draws it to
 * the screen.
 */
const NoiseFixture: React.FC<INoiseFixture> = (props) => {
  const { width, height, clear } = props;
  // SimplexNoiseJSX calls a hook: call it unconditionally, every render.
  const noise = SimplexNoiseJSX({
    name: "simplex",
    output: "noise",
    scale: props.scale,
    zOffset: props.zOffset,
  });

  return (
    <TestSurface width={width} height={height} clear={clear}>
      <TextureJSX
        name="noise"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("nearest")}
      />
      {noise}
      {DrawJSX({ name: "present", input: "noise" })}
    </TestSurface>
  );
};

registerFixture("resources/noise", NoiseFixture);
