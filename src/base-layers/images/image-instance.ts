import { observable } from "../../instance-provider";
import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2 } from "../../util/vector";
import { Anchor, AnchorType, ScaleMode } from "../types";
import { Image } from "src/primitives";
import { ImageAtlasResourceRequest } from "src/resources";

export interface IImageInstanceOptions extends IInstanceOptions {
  /**
   * The point on the image which will be placed in world space via the x, y coords. This is also the point
   * which the image will be scaled around.
   */
  anchor?: Anchor;
  /** Depth sorting of the image (or the z value of the lable) */
  depth?: number;
  /** This is the HTMLImageElement that the image is to render. This element MUST be loaded completely before this instance is created. */
  element: HTMLImageElement;
  /** The height of the image as it is to be rendered in world space */
  height?: number;
  /** The coordinate where the image will be anchored to in world space */
  position?: Vec2;
  /** Sets the way the image scales with the world */
  scaling?: ScaleMode;
  /** The color the image should render as */
  tint: [number, number, number, number];
  /** The width of the image as it is to be rendered in world space */
  width?: number;

  source: string | Image | ImageData | HTMLCanvasElement;

  onReady?: (image: ImageInstance) => void;
}

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {
  [key: number]: (anchor: Anchor, image: ImageInstance) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor, _image: ImageInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = image.height / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width / 2.0;
    anchor.y = image.height / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width + anchor.padding;
    anchor.y = image.height / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = image.height + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width / 2.0;
    anchor.y = image.height + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, image: ImageInstance) => {
    anchor.x = image.width + anchor.padding;
    anchor.y = image.height + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, _image: ImageInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  }
};

/**
 * This generates a new image instance.
 * There are restrictions surrounding images due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a image via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Images should only be so large.
 * - Once a image is constructed, only SOME properties can be altered thereafter
 *
 * An image that is constructed can only have some properties set upon creating the image and are locked
 * thereafter. The only way to modify them would be to destroy the image, then construct a new image
 * with the modifications. This has to deal with performance regarding rasterizing the image.
 */
export class ImageInstance extends Instance {
  /** This is the rendered color of the image */
  @observable tint: [number, number, number, number] = [0, 0, 0, 1];
  /** Depth sorting of the image (or the z value of the lable) */
  @observable depth: number = 0;
  /** The height of the image as it is to be rendered in world space */
  @observable height: number = 1;
  /** The width of the image as it is to be rendered in world space */
  @observable width: number = 1;
  /** The coordinate where the image will be anchored to in world space */
  @observable position: Vec2 = [0, 0];
  /** Sets the way the image scales with the world */
  @observable scaling: ScaleMode = ScaleMode.BOUND_MAX;

  @observable source: string | Image | ImageData | HTMLCanvasElement;
  element: HTMLImageElement;

  // These are properties that can be altered, but have side effects from being changed
  onReady?: (image: ImageInstance) => void;

  //request
  request: ImageAtlasResourceRequest;

  /** This is the anchor location on the  */
  @observable
  anchor: Anchor = {
    padding: 0,
    type: AnchorType.TopLeft,
    x: 0,
    y: 0
  };

  constructor(options: IImageInstanceOptions) {
    super(options);

    this.depth = options.depth || this.depth;
    this.tint = options.tint || this.tint;
    this.scaling = options.scaling || this.scaling;
    this.position = options.position || this.position;
    this.anchor = options.anchor || this.anchor;
    this.source = options.source;
    this.element = options.element;

    this.onReady = options.onReady;
  }

  clone() {
    const image = new ImageInstance(this);
    image.onReady = this.onReady;
    image.request = this.request;
  }

  resourceTrigger() {
    this.tint = this.tint;
    this.depth = this.depth;
    this.height = this.height;
    this.scaling = this.scaling;
    this.position = this.position;
    this.anchor = this.anchor;
    this.source = this.source;
    this.element = this.element;

    if (this.onReady) this.onReady(this);
  }

  /**
   * This applies a new anchor to this image and properly determines it's anchor position on the image
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
    this.anchor = newAnchor;
  }

  static destroy() {
    /* TODO */
  }
}
