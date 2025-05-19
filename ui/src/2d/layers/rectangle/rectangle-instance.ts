import { makeObservable, observable } from "../../../instance-provider";
import {
  IInstanceOptions,
  Instance,
} from "../../../instance-provider/instance.js";
import { Vec2, type Vec4 } from "../../../math/vector.js";
import type { Color } from "../../../types.js";
import { Anchor, AnchorType, ScaleMode } from "../../types.js";

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
  /**
   * The thickness of the outline of the rectangle. This fits "within" the size
   * of the rectangle and does not add to it
   */
  outline?: number;
  /** The color of the outline of the rectangle when outline is non-zero */
  outlineColor?: Color;
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
  },
};

/**
 * Renders a rectangle with some given properties that supports some scale
 * modes.
 *
 * Be warned, there are more properties in the rectangle than the GPU can handle
 * easily so animating too many properties can lose performance rapidly.
 */
export class RectangleInstance extends Instance {
  /** This is the rendered color of the rectangle */
  @observable color: [number, number, number, number] = [0, 0, 0, 1];
  /** Depth sorting of the rectangle (or the z value of the rectangle) */
  @observable depth = 0;
  /** When in BOUND_MAX mode, this allows the rectangle to scale up beyond it's
   * max size */
  @observable maxScale = 1;
  /** Scales the rectangle uniformly */
  @observable scale = 1;
  /** Sets the way the rectangle scales with the world */
  @observable scaling: ScaleMode = ScaleMode.BOUND_MAX;
  /** The size of the rectangle as it is to be rendered in world space */
  @observable size: Vec2 = [1, 1];
  /** The coordinate where the rectangle will be anchored to in world space */
  @observable position: Vec2 = [0, 0];
  /** When true, wll render the rectangle as an outline */
  @observable outline = 0;
  /** When outline is > 0, this will be the color that it renders */
  @observable outlineColor: Vec4 = [0, 0, 0, 1];

  // These are properties that can be altered, but have side effects from being
  // changed

  /** This is the anchor location on the  */
  @observable
  private _anchor: Anchor = {
    padding: 0,
    type: AnchorType.TopLeft,
    x: 0,
    y: 0,
  };

  constructor(options: IRectangleInstanceOptions) {
    super(options);
    makeObservable(this, RectangleInstance);

    this.depth = options.depth || this.depth;
    this.color = options.color || this.color;
    this.scaling = options.scaling || this.scaling;
    this.position = options.position || this.position;
    this.size = options.size || this.size;
    this.outline = options.outline || this.outline;
    this.outlineColor = options.outlineColor || this.outlineColor;

    // Make sure the anchor is set to the appropriate location
    if (options.anchor) this.setAnchor(options.anchor);
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
      y: anchor.y || 0,
    };

    // Calculate the new anchors position values
    anchorCalculator[newAnchor.type](newAnchor, this);
    // Apply the anchor
    this._anchor = newAnchor;
  }
}
