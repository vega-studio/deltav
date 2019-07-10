export * from "./auto-easing-method";
export * from "./base-projection";
export * from "./matrix";
export * from "./quaternion";
export * from "./vector";

import * as matrix from "./matrix";
import * as quaternion from "./quaternion";
import * as vector from "./vector";

export const MathV = {
  Matrix: matrix,
  Vector: vector,
  Quaternion: quaternion
};
