import React from "react";

import {
  BoxSampleJSX,
  BoxSampleJSXDirection,
  DrawJSX,
  FragmentOutputType,
  PostProcessJSX,
  TextureJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import {
  type IColorRect,
  rectsShader,
  type RGBA01,
  rgbaTextureSettings,
} from "./common.js";

export interface IChainFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** The rect the first pass writes */
  rect: IColorRect;
}

/**
 * A chain of four passes over three canvas-sized textures: "source" writes the
 * rect into "a"; box up-samples "a" into "b" and "b" into "c" (each a 4-tap
 * average at ±0.5 texel, which leaves a solid area solid and spreads an edge
 * by one pixel); "present" draws "c" to the screen.
 */
const ChainFixture: React.FC<IChainFixture> = (props) => {
  const { width, height, clear } = props;

  return (
    <TestSurface width={width} height={height} clear={clear}>
      {["a", "b", "c"].map((name) => (
        <TextureJSX
          key={name}
          name={name}
          width={width}
          height={height}
          textureSettings={rgbaTextureSettings("linear")}
        />
      ))}
      {PostProcessJSX({
        name: "source",
        buffers: {},
        output: {
          buffers: { [FragmentOutputType.COLOR]: "a" },
          depth: false,
        },
        material: { blending: null },
        shader: rectsShader([props.rect], clear),
      })}
      {BoxSampleJSX({
        name: "box1",
        input: "a",
        output: "b",
        direction: BoxSampleJSXDirection.UP,
        material: { blending: null },
      })}
      {BoxSampleJSX({
        name: "box2",
        input: "b",
        output: "c",
        direction: BoxSampleJSXDirection.UP,
        material: { blending: null },
      })}
      {DrawJSX({ name: "present", input: "c" })}
    </TestSurface>
  );
};

registerFixture("resources/chain", ChainFixture);
