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
  /** This is the location of the anchor. If a custom anchor is specified, then the x and y are not automatically populated */
  type: AnchorType;
  /** This is populated with the anchor's location relative to the image's surface */
  x?: number;
  /** This is populated with the anchor's location relative to the image's surface */
  y?: number;
};

export enum ScaleType {
  /** The size of the image will be tied to world space */
  ALWAYS = 1,
  /** The image will scale to it's font size then stop growing */
  BOUND_MAX = 2,
  /** The image will alwyas retain it's font size on screen */
  NEVER = 3
}
