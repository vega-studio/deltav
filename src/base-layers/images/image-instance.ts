import { observable } from "../../instance-provider";
import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { IAtlasResourceRequest } from "../../resources";
import { Vec2 } from "../../util/vector";
import { Anchor, AnchorType, ScaleMode } from "../types";

const { max } = Math;

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
  /**
   * The height of the image as it is to be rendered in world space.
   * After onReady: this is immediately populated with the width and height of the image as it
   * appears in the atlas.
   */
  @observable height: number = 1;
  /** The coordinate where the image will be located in world space */
  @observable origin: Vec2 = [0, 0];
  /** Sets the way the image scales with the world */
  @observable scaling: ScaleMode = ScaleMode.BOUND_MAX;
  /** This is where the source of the image will come from */
  @observable source: string | TexImageSource;
  /**
   * The width of the image as it is to be rendered in world space.
   * After onReady: this is immediately populated with the width and height of the image as it
   * appears in the atlas.
   */
  @observable width: number = 1;

  /**
   * This property reflects the maximum size a single dimension of the image will take up.
   * This means if you set this value to 100 at least the width or the height will be 100
   * depending on the aspect ratio of the image.
   */
  get maxSize() {
    return max(this.width, this.height);
  }
  set maxSize(value: number) {
    const aspect = this.width / this.height;
    this.width = value * aspect;
    this.height = value;
  }

  /** This is the request generated for the instance to retrieve the correct resource */
  request?: IAtlasResourceRequest;
  /** After oneReady: This is populated with the width of the source image loaded into the Atlas */
  sourceWidth: number = 0;
  /** After oneReady: This is populated with the height of the source image loaded into the Atlas */
  sourceHeight: number = 0;

  /**
   * This is a position relative to the image. This will align the image such that the anchor point on
   * the image will be located at the origin in world space.
   */
  @observable
  private _anchor: Anchor = {
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
    this.origin = options.position || this.origin;
    this.width = options.width || 1;
    this.height = options.height || 1;

    // Make sure the anchor is set to the appropriate location
    options.anchor && this.setAnchor(options.anchor);
  }

  get anchor() {
    return this._anchor;
  }

  /** This is triggered after the request has been completed */
  resourceTrigger() {
    this.tint = this.tint;
    this.depth = this.depth;
    this.height = this.height;
    this.scaling = this.scaling;
    this.width = this.width;
    this.origin = this.origin;

    if (this.request && this.request.texture) {
      this.sourceWidth = this.request.texture.pixelWidth;
      this.sourceHeight = this.request.texture.pixelHeight;
    }
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
    this._anchor = newAnchor;
  }
}
