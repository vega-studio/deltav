export * from "./gauss-horizontal-blur/gauss-horizontal-blur";
export * from "./gauss-vertical-blur/gauss-vertical-blur";
export * from "./box-sample/box-sample";
export * from "./bloom/bloom";
export * from "./draw/draw";
export * from "./trail/trail";

import { bloom } from "./bloom/bloom";
import { trail } from "./trail/trail";
import { boxSample } from "./box-sample/box-sample";
import { draw } from "./draw/draw";
import { gaussHorizontalBlur } from "./gauss-horizontal-blur/gauss-horizontal-blur";
import { gaussVerticalBlur } from "./gauss-vertical-blur/gauss-vertical-blur";

export const PostEffect = {
  bloom,
  boxSample,
  draw,
  gaussHorizontalBlur,
  gaussVerticalBlur,
  trail,
};
