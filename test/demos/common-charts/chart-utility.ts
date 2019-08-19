import { rgb } from "d3-color";
import { color4FromHex3, Vec4 } from "src";

export type Color = Vec4 | string | number;

export function getColor(c: Color): Vec4 {
  if (typeof c === "string") {
    const rgbColor = rgb(c);
    return [rgbColor.r, rgbColor.g, rgbColor.b, rgbColor.opacity];
  }

  if (typeof c === "number") {
    const rgbColor = color4FromHex3(c);
    return rgbColor;
  }

  return c;
}

export function getSum(datas: number[]) {
  let sum = 0;

  for (let i = 0, endi = datas.length; i < endi; i++) {
    sum += datas[i];
  }

  return sum;
}
