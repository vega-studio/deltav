export enum ScaleMode {
  /** The size of the image will be tied to world space */
  ALWAYS = 1,
  /** The image will scale to it's font size then stop growing */
  BOUND_MAX = 2,
  /** The image will alwyas retain it's font size on screen */
  NEVER = 3
}

export enum EdgePositionSpace {
  WORLD = 0,
  START_RELATIVE_TO_END = 1,
  END_RELATIVE_TO_START = 2
}

export enum EdgeControlSpace {
  WORLD = 0,
  CONTROL1_RELATIVE_TO_START = 1,
  CONTROL1_RELATIVE_TO_END = 2,
  CONTROL2_RELATIVE_TO_START = 3,
  CONTROL2_RELATIVE_TO_END = 4,
  CONTROL1_RELATIVE_TO_START_CONTROL2_RELATIVE_TO_END = 5,
  CONTROL1_RELATIVE_TO_START_CONTROL2_RELATIVE_TO_START = 6,
  CONTROL1_RELATIVE_TO_END_CONTROL2_RELATIVE_TO_END = 7,
  CONTROL1_RELATIVE_TO_END_CONTROL2_RELATIVE_TO_START = 8
}

export enum EdgeSizeSpace {
  WORLD = 0,
  SCREEN = 1,
  START_SCREEN_END_WORLD = 2,
  START_WORLD_END_SCREEN = 3
}

// We make a control for padding, as it adds a lot to the processing if present.
export enum EdgePadding {
  NONE,
  START,
  END,
  BOTH
}
