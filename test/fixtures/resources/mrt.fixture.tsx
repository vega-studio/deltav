import React from "react";

import {
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

export interface IMRTFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Rects written to the COLOR output (texture "first") */
  first: IColorRect[];
  /** Rects written to the GLOW output (texture "second") */
  second: IColorRect[];
}

/**
 * One pass writes two fragment outputs at once, COLOR into texture "first"
 * and GLOW into texture "second" (both the canvas size). DrawJSX then draws
 * "first" into the left half of the canvas and "second" into the right half,
 * each texture squeezed to half the width.
 */
const MRTFixture: React.FC<IMRTFixture> = (props) => {
  const { width, height, clear } = props;

  return (
    <TestSurface width={width} height={height} clear={clear}>
      <TextureJSX
        name="first"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("nearest")}
      />
      <TextureJSX
        name="second"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("nearest")}
      />
      {PostProcessJSX({
        name: "write",
        buffers: {},
        output: {
          buffers: {
            [FragmentOutputType.COLOR]: "first",
            [FragmentOutputType.GLOW]: "second",
          },
          depth: false,
        },
        material: { blending: null },
        shader: [
          {
            outputType: FragmentOutputType.COLOR,
            source: rectsShader(props.first, clear),
          },
          {
            outputType: FragmentOutputType.GLOW,
            source: rectsShader(props.second, clear, {
              out: "glow",
              prefix: "glow",
              imports: false,
            }),
          },
        ],
      })}
      {DrawJSX({
        name: "left",
        input: "first",
        view: {
          config: {
            viewport: { left: 0, top: 0, width: "50%", height: "100%" },
          },
        },
      })}
      {DrawJSX({
        name: "right",
        input: "second",
        view: {
          config: {
            viewport: { left: "50%", top: 0, width: "50%", height: "100%" },
          },
        },
      })}
    </TestSurface>
  );
};

registerFixture("resources/mrt", MRTFixture);
