import React from "react";

import {
  FloatTextureJSX,
  FragmentOutputType,
  PostProcessJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type IColorRect, rectsShader, type RGBA01 } from "./common.js";

export interface IFloatTextureFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Rects of raw float values (any range) written into the float target */
  rects: IColorRect[];
  /** Float value written everywhere outside the rects */
  background: RGBA01;
  /** The read-back pass draws `(value + offset) * scale` per RGB channel */
  offset: number;
  scale: number;
}

/**
 * Pass "write" renders raw float values (outside 0–1) into a 4-channel
 * FloatTextureJSX of the canvas size; pass "read" samples it and draws
 * `(value + offset) * scale` to the screen, alpha 1, without blending.
 */
const FloatTextureFixture: React.FC<IFloatTextureFixture> = (props) => {
  const { width, height } = props;

  return (
    <TestSurface width={width} height={height} clear={props.clear}>
      <FloatTextureJSX
        name="values"
        width={width}
        height={height}
        channels={4}
        data={new Float32Array(width * height * 4)}
      />
      {PostProcessJSX({
        name: "write",
        buffers: {},
        output: {
          buffers: { [FragmentOutputType.COLOR]: "values" },
          depth: false,
        },
        material: { blending: null },
        shader: rectsShader(props.rects, props.background),
      })}
      {PostProcessJSX({
        name: "read",
        buffers: { values: "values" },
        material: { blending: null },
        shader: `
          void main() {
            vec4 v = texture(values, texCoord);
            $\{out: color} = vec4((v.rgb + ${props.offset.toFixed(
              4
            )}) * ${props.scale.toFixed(4)}, 1.0);
          }
        `,
      })}
    </TestSurface>
  );
};

registerFixture("resources/float-texture", FloatTextureFixture);
