import { computed, observable } from "mobx";
import { IInstanceOptions, Instance } from "../../util/instance";
import { Anchor, AnchorType, ScaleType } from "../types";

export interface IRectangleInstanceOptions extends IInstanceOptions {
  /**
   * The point on the rectangle which will be placed in world space via the x, y coords. This is also the point
   * which the rectangle will be scaled around.
   */
  anchor?: Anchor;
  /** Depth sorting of the rectangle (or the z value of the lable) */
  depth?: number;
  /** The height of the rectangle as it is to be rendered in world space */
  height?: number;
  /** Sets the way the rectangle scales with the world */
  scaling?: ScaleType;
  /** The color the rectangle should render as */
  color: [number, number, number, number];
  /** The width of the rectangle as it is to be rendered in world space */
  width?: number;
  /** The x coordinate where the rectangle will be anchored to in world space */
  x?: number;
  /** The y coordinate where the rectangle will be anchored to in world space */
  y?: number;
}

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {
  [key: number]: (anchor: Anchor, rectangle: RectangleInstance) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = rectangle.height / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width / 2.0;
    anchor.y = rectangle.height / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width + anchor.padding;
    anchor.y = rectangle.height / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = rectangle.height + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width / 2.0;
    anchor.y = rectangle.height + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.width + anchor.padding;
    anchor.y = rectangle.height + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  }
};

/**
 * This generates a new rectangle instance which will render a single line of text for a given layer.
 * There are restrictions surrounding rectangles due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a rectangle via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Rectangles should only be so long.
 * - Multiline is not supported inherently
 * - Once a rectangle is constructed, only SOME properties can be altered thereafter
 *
 * A rectangle that is constructed can only have some properties set upon creating the rectangle and are locked
 * thereafter. The only way to modify them would be to destroy the rectangle, then construct a new rectangle
 * with the modifications. This has to deal with performance regarding rasterizing the rectangle
 */
export class RectangleInstance extends Instance {
  /** This is the rendered color of the rectangle */
  @observable color: [number, number, number, number] = [0, 0, 0, 1];
  /** Depth sorting of the rectangle (or the z value of the lable) */
  @observable depth: number = 0;
  /** The height of the rectangle as it is to be rendered in world space */
  @observable height: number = 1;
  /** Sets the way the rectangle scales with the world */
  @observable scaling: ScaleType = ScaleType.BOUND_MAX;
  /** The width of the rectangle as it is to be rendered in world space */
  @observable width: number = 1;
  /** The x coordinate where the rectangle will be anchored to in world space */
  @observable x: number = 0;
  /** The y coordinate where the rectangle will be anchored to in world space */
  @observable y: number = 0;

  // These are properties that can be altered, but have side effects from being changed

  /** This is the anchor location on the  */
  @observable
  private _anchor: Anchor = {
    padding: 0,
    type: AnchorType.TopLeft,
    x: 0,
    y: 0
  };

  constructor(options: IRectangleInstanceOptions) {
    super(options);

    this.depth = options.depth || this.depth;
    this.color = options.color || this.color;
    this.scaling = options.scaling || this.scaling;
    this.x = options.x || this.x;
    this.y = options.y || this.y;
    this.width = options.width || 1;
    this.height = options.height || 1;

    // Make sure the anchor is set to the appropriate location
    options.anchor && this.setAnchor(options.anchor);
  }

  @computed
  get anchor() {
    return this._anchor;
  }

  /**
   * This applies a new anchor to this rectangle and properly determines it's anchor position on the rectangle
   */
  setAnchor(anchor: Anchor) {
    const newAnchor = {
      padding: anchor.padding || 0,
      type: anchor.type,
      x: anchor.x || 0,
      y: anchor.y || 0
    };

    // Calculate the new anchors position values
    anchorCalculator[newAnchor.type](newAnchor, this);
    // Apply the anchor
    this._anchor = newAnchor;
  }
}
