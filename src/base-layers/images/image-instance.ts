import { observable } from "../../instance-provider";
import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Image } from "../../primitives/image";
import { ImageAtlasResource, ImageRasterizer } from "../../surface/texture";
import { Vec2 } from "../../util/vector";
import { Anchor, AnchorType, ScaleType } from "../types";

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
  scaling?: ScaleType;
  /** The color the image should render as */
  tint: [number, number, number, number];
  /** The width of the image as it is to be rendered in world space */
  width?: number;
}

/**
 * This is a reference for a rasterization that has reference counting. When the references go to zero,
 * the rasterization should be invalidated and resources freed for the rasterization.
 */
type RasterizationReference = {
  resource: ImageAtlasResource;
  references: number;
};

/**
 * This is a lookup to find existing rasterizations for a particularly created image so that every
 * new image does not have to go through the rasterization process.
 */
const rasterizationLookUp = new Map<
  string | HTMLImageElement,
  RasterizationReference
>();

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
export class ImageInstance extends Instance implements Image {
  /**
   * TODO: We should be implementing the destroy on ImageInstances to clean this up
   * Frees up module scoped data.
   */
  static destroy() {
    rasterizationLookUp.clear();
  }

  /** This is the rendered color of the image */
  @observable tint: [number, number, number, number] = [0, 0, 0, 1];
  /** Depth sorting of the image (or the z value of the lable) */
  @observable depth: number = 0;
  /** The height of the image as it is to be rendered in world space */
  @observable height: number = 1;
  /** The coordinate where the image will be anchored to in world space */
  @observable position: Vec2 = [0, 0];
  /** Sets the way the image scales with the world */
  @observable scaling: ScaleType = ScaleType.BOUND_MAX;
  /** The width of the image as it is to be rendered in world space */
  @observable width: number = 1;

  get size() {
    return max(this.width, this.height);
  }
  set size(value: number) {
    const aspect = this.width / this.height;
    this.width = value * aspect;
    this.height = value;
  }

  // The following properties are properties that are locked in after creating this image
  // As the properties are completely locked into how the image was rasterized and can not
  // Nor should not be easily adjusted for performance concerns

  private _sourceWidth: number = 0;
  private _sourceHeight: number = 0;
  private _isDestroyed: boolean = false;
  @observable private _rasterization: RasterizationReference;
  private _path: string;
  private _element: HTMLImageElement;

  // The following are the getters for the locked in parameters of the image so we can read
  // The properties but not set any of them.

  /** This is the provided element this image will be rendering */
  get element() {
    return this._element;
  }
  /** This flag indicates if this image is valid anymore */
  get isDestroyed() {
    return this._isDestroyed;
  }
  /** This is the path to the image's resource if it's available */
  get path() {
    return this._path;
  }
  /** This gets the atlas resource that is uniquely idenfied for this image */
  get resource() {
    return this._rasterization.resource;
  }

  /**
   * This is the width in world space of the image. If there is no camera distortion,
   * this would be the width of the image in pixels on the screen.
   */
  get sourceWidth() {
    return this._sourceWidth;
  }

  /**
   * This is the height in world space of the image. If there is no camera distortion,
   * this would be the height of the image in pixels on the screen.
   */
  get sourceHeight() {
    return this._sourceHeight;
  }

  // These are properties that can be altered, but have side effects from being changed

  /** This is the anchor location on the  */
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
    this.position = options.position || this.position;

    // This is the image that is to be rendered
    this._element = options.element;
    // Look for other same texts that have been rasterized
    let rasterization = rasterizationLookUp.get(this._path || this._element);

    // If a rasterization exists, we must increment the use reference
    if (rasterization) {
      rasterization.references++;
    }

    // If we have not found an existing rasterization
    if (!rasterization) {
      rasterization = {
        references: 1,
        resource: new ImageAtlasResource(this)
      };

      // Ensure the sample scale is set. Defaults to 1.0
      rasterization.resource.sampleScale =
        rasterization.resource.sampleScale || 1.0;
      // Rasterize the resource generated for this image. We need it immediately rasterized so
      // That we can utilize the dimensions for calculations.
      ImageRasterizer.renderSync(rasterization.resource);
      // Now that we have an official rasterization for this image, we shall store it
      // For others to look up
      rasterizationLookUp.set(this._path || this._element, rasterization);
    }

    this._rasterization = rasterization;
    this._sourceWidth = rasterization.resource.rasterization.world.width;
    this._sourceHeight = rasterization.resource.rasterization.world.height;

    this.width = options.width || this._sourceWidth || 1;
    this.height = options.height || this._sourceHeight || 1;

    // Make sure the anchor is set to the appropriate location
    options.anchor && this.setAnchor(options.anchor);
  }

  get anchor() {
    return this._anchor;
  }

  /**
   * Images are a sort of unique case where the use of a image should be destroyed as rasterization
   * resources are in a way kept alive through reference counting.
   */
  destroy() {
    if (!this._isDestroyed) {
      this._isDestroyed = true;
      this._rasterization.references--;

      // If all references are cleared, then the rasterization needs to be eradicated
      if (this._rasterization.references === 0) {
        this._rasterization.resource;
        console.warn("The destroy method still needs completion");
      }
    }
  }

  resourceTrigger() {
    // Trigger the accessed element that the layer utilizes for resource fetching.
    this._rasterization = this._rasterization;

    this.tint = this.tint;
    this.depth = this.depth;
    this.height = this.height;
    this.scaling = this.scaling;
    this.width = this.width;
    this.position = this.position;
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
