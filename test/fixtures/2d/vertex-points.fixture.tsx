import React from "react";

import { VertexPointsLayer } from "../../../ui/src/2d/layers/vertex-points/vertex-points-layer.js";
import type { Instance } from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import {
  type IScene2DProps,
  type LayerKind,
  type RGBA01,
  Scene2D,
} from "./scene.js";

/** Formats a number as a GLSL float literal. */
const f = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

/**
 * VertexPointsLayer (imported by path: the 2D layers barrel does not export
 * it). The layer has no instances of its own; its config takes `points`
 * (world positions), `pointSize` (pixels) and `color`, which become a custom
 * vertex shader placing vertex `i` at `points[i]` and a flat-colour fragment
 * shader.
 */
export const vertexPointsKind: LayerKind<Instance, never> = {
  type: VertexPointsLayer,
  create: () => {
    throw new Error("VertexPointsLayer fixtures take no instances");
  },
  update: () => undefined,
  config: ({ points = [], pointSize = 8, color = [1, 1, 1, 1] }) => {
    const pts = points as [number, number][];
    const select = pts
      .slice(1)
      .map(
        ([x, y], i) =>
          `if (vertexIndex > ${f(i + 0.5)}) p = vec2(${f(x)}, ${f(y)});`
      )
      .join("\n");
    const [r, g, b, a] = color as RGBA01;
    return {
      numPoints: pts.length,
      vs: `
        void main() {
          vec2 p = vec2(${f(pts[0]?.[0] ?? 0)}, ${f(pts[0]?.[1] ?? 0)});
          ${select}
          gl_Position = clipSpace(vec3(p, 0.0));
          gl_PointSize = ${f(pointSize as number)};
        }
      `,
      fs: `
        void main() {
          \${out: color} = vec4(${f(r)}, ${f(g)}, ${f(b)}, ${f(a)});
        }
      `,
    };
  },
};

const VertexPointsFixture: React.FC<IScene2DProps<never>> = (props) => (
  <Scene2D {...props} kind={vertexPointsKind} />
);

registerFixture("2d/vertex-points", VertexPointsFixture);
