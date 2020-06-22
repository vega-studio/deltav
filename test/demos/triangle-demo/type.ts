export enum ScaleMode {
  /** The size of the image will be tied to world space */
  ALWAYS = 1,
  /** The image will scale to it's font size then stop growing */
  BOUND_MAX = 2,
  /** The image will alwyas retain it's font size on screen */
  NEVER = 3
}
