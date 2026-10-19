import React from "react";

import {
  BloomJSX,
  ClearFlags,
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

export interface IBloomFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** The bright rect: drawn into the scene and into the glow source */
  bright: IColorRect;
  /** The dark rect: drawn into the scene only */
  dark: IColorRect;
  /** BloomJSX `samples` (down-sampled glow levels, each half the last) */
  samples: number;
}

/**
 * Pass "scene" writes both rects into texture "scene"; pass "glow-source"
 * writes only the bright rect into texture "glow". BloomJSX down-samples the
 * glow through `samples` textures, each half the size of the last, adds the
 * levels back up and composes `scene + glow` onto the cleared screen.
 */
const BloomFixture: React.FC<IBloomFixture> = (props) => {
  const { width, height, clear } = props;
  const levels: { name: string; width: number; height: number }[] = [];
  for (let i = 1; i <= props.samples; ++i) {
    levels.push({
      name: `level${i}`,
      width: Math.floor(width / 2 ** i),
      height: Math.floor(height / 2 ** i),
    });
  }

  return (
    <TestSurface width={width} height={height} clear={clear}>
      <TextureJSX
        name="scene"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("linear")}
      />
      <TextureJSX
        name="glow"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("linear")}
      />
      {levels.map((level) => (
        <TextureJSX
          key={level.name}
          name={level.name}
          width={level.width}
          height={level.height}
          textureSettings={rgbaTextureSettings("linear")}
        />
      ))}
      {PostProcessJSX({
        name: "scene",
        buffers: {},
        output: {
          buffers: { [FragmentOutputType.COLOR]: "scene" },
          depth: false,
        },
        material: { blending: null },
        shader: rectsShader([props.dark, props.bright], clear),
      })}
      {PostProcessJSX({
        name: "glow-source",
        buffers: {},
        output: {
          buffers: { [FragmentOutputType.COLOR]: "glow" },
          depth: false,
        },
        material: { blending: null },
        shader: rectsShader([props.bright], clear),
      })}
      {BloomJSX({
        name: "bloom",
        samples: props.samples,
        resources: ["glow", ...levels.map((l) => l.name)],
        compose: "scene",
        view: {
          config: {
            background: clear,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}
    </TestSurface>
  );
};

registerFixture("resources/bloom", BloomFixture);
