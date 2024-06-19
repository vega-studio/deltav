import type { Vec2 } from "../../../src";

export function scaleLinear(domain: Vec2, range: Vec2) {
  return function (x: number) {
    return (
      ((x - domain[0]) / (domain[1] - domain[0])) *
      (range[1] - range[0] + range[0])
    );
  };
}
