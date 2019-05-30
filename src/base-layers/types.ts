import { Vec2 } from "../util/vector";

export enum AnchorType {
  BottomLeft,
  BottomMiddle,
  BottomRight,
  Custom,
  Middle,
  MiddleLeft,
  MiddleRight,
  TopLeft,
  TopMiddle,
  TopRight
}

export type Anchor = {
  /** When the anchor gets calculated on the image, this allows the anchor to go beyond the borders of the image by this amount */
  padding: number;
  /**
   * A padding must contain dimensions for all axis involved. Padding as a scalar is too ambiguous. This holds the calculated
   * direction the padding applies. The padding value you would provide is just a magnitude that is used to inevitably calculate
   * this value.
   */
  paddingDirection?: Vec2;
  /** This is the location of the anchor. If a custom anchor is specified, then the x and y are not automatically populated */
  type: AnchorType;
  /** This is populated with the anchor's location relative to the image's surface */
  x?: number;
  /** This is populated with the anchor's location relative to the image's surface */
  y?: number;
};

export enum ScaleMode {
  /** The size of the image will be tied to world space */
  ALWAYS = 1,
  /** The image will scale to it's font size then stop growing */
  BOUND_MAX = 2,
  /** The image will alwyas retain it's font size on screen */
  NEVER = 3,
  /** The textArea will scale to max scale and then stop growing */
  TEXT_AREA_BOUND_MAX = 4,
  /** The textArea will always stay the same size */
  TEXT_AREA_NEVER = 5
}
