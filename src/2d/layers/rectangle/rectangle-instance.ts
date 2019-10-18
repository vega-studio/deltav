import { observable } from "../../../instance-provider";
import {
  IInstanceOptions,
  Instance
} from "../../../instance-provider/instance";
import { Vec2 } from "../../../math/vector";
import { Anchor, AnchorType, ScaleMode } from "../../types";

export interface IRectangleInstanceOptions extends IInstanceOptions {
  /**
   * The point on the rectangle which will be placed in world space via the x, y coords. This is also the point
   * which the rectangle will be scaled around.
   */
  anchor?: Anchor;
  /** Depth sorting of the rectangle (or the z value of the box) */
  depth?: number;
  /** Sets the way the rectangle scales with the world */
  scaling?: ScaleMode;
  /** The color the rectangle should render as */
  color?: [number, number, number, number];
  /** The coordinate where the rectangle will be anchored to in world space */
  position?: Vec2;
  /** The size of the rectangle as it is to be rendered in world space */
  size?: Vec2;
}

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {
  [key: number]: (anchor: Anchor, rectangle: RectangleInstance) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor, _rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = rectangle.size[1] / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] / 2.0;
    anchor.y = rectangle.size[1] / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] + anchor.padding;
    anchor.y = rectangle.size[1] / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = rectangle.size[1] + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] / 2.0;
    anchor.y = rectangle.size[1] + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, rectangle: RectangleInstance) => {
    anchor.x = rectangle.size[0] + anchor.padding;
    anchor.y = rectangle.size[1] + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, _rectangle: RectangleInstance) => {
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
  /** When in BOUND_MAX mode, this allows the rectangle to scale up beyond it's max size */
  @observable maxScale: number = 1;
  /** Scales the rectangle uniformly */
  @observable scale: number = 1;
  /** Sets the way the rectangle scales with the world */
  @observable scaling: ScaleMode = ScaleMode.BOUND_MAX;
  /** The size of the rectangle as it is to be rendered in world space */
  @observable size: Vec2 = [1, 1];
  /** The coordinate where the rectangle will be anchored to in world space */
  @observable position: Vec2 = [0, 0];

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
    this.position = options.position || this.position;
    this.size = options.size || this.size;

    // Make sure the anchor is set to the appropriate location
    options.anchor && this.setAnchor(options.anchor);
  }

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
