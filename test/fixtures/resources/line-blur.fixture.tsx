import React from "react";

import {
  BoxSampleJSX,
  BoxSampleJSXDirection,
  FragmentOutputType,
  GaussHorizontalBlurJSX,
  GaussVerticalBlurJSX,
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

export interface ILineBlurFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /**
   * "vertical": a 1 px wide white column at x = `at`; "horizontal": a 1 px
   * tall white row at y = `at` (top-left pixel coordinates)
   */
  line: "vertical" | "horizontal";
  at: number;
  /** The effect that reads the line texture and draws to the screen */
  effect: "box-up" | "box-down" | "gauss-horizontal" | "gauss-vertical";
  /** Min/mag filter of the line texture */
  filter: "nearest" | "linear";
}

const WHITE: RGBA01 = [1, 1, 1, 1];

/**
 * Pass "line" writes a single-pixel-wide white line on the clear colour into
 * a texture of the canvas size; one blur effect then samples that texture and
 * draws straight to the screen (same size, so one screen pixel = one texel).
 */
const LineBlurFixture: React.FC<ILineBlurFixture> = (props) => {
  const { width, height, clear } = props;
  const line: IColorRect =
    props.line === "vertical"
      ? { x: props.at, y: 0, width: 1, height, color: WHITE }
      : { x: 0, y: props.at, width, height: 1, color: WHITE };

  let effect: React.ReactNode;
  switch (props.effect) {
    case "box-up":
    case "box-down":
      effect = BoxSampleJSX({
        name: "blur",
        input: "line",
        direction:
          props.effect === "box-up"
            ? BoxSampleJSXDirection.UP
            : BoxSampleJSXDirection.DOWN,
        material: { blending: null },
      });
      break;
    case "gauss-horizontal":
      effect = GaussHorizontalBlurJSX({ name: "blur", input: "line" });
      break;
    case "gauss-vertical":
      effect = GaussVerticalBlurJSX({ name: "blur", input: "line" });
      break;
  }

  return (
    <TestSurface width={width} height={height} clear={clear}>
      <TextureJSX
        name="line"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings(props.filter)}
      />
      {PostProcessJSX({
        name: "draw-line",
        buffers: {},
        output: {
          buffers: { [FragmentOutputType.COLOR]: "line" },
          depth: false,
        },
        material: { blending: null },
        shader: rectsShader([line], clear),
      })}
      {effect}
    </TestSurface>
  );
};

registerFixture("resources/line-blur", LineBlurFixture);
