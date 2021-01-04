export * from "./gauss-horizontal-blur/gauss-horizontal-blur";
export * from "./gauss-vertical-blur/gauss-vertical-blur";

import { gaussHorizontalBlur } from "./gauss-horizontal-blur/gauss-horizontal-blur";
import { gaussVerticalBlur } from "./gauss-vertical-blur/gauss-vertical-blur";

export const PostEffect = {
  gaussHorizontalBlur,
  gaussVerticalBlur
};
