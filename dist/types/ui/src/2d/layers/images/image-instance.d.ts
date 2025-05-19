import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Vec2 } from "../../../math/vector.js";
import { IAtlasResourceRequest } from "../../../resources";
import { Anchor, ScaleMode } from "../../types.js";
import { ImageInstanceResource } from "./image-layer";
export interface IImageInstanceOptions extends IInstanceOptions {
    /**
     * The point on the image which will be placed in world space via the x, y coords. This is also the point
     * which the image will be scaled around.
     */
    anchor?: Anchor;
    /** Depth sorting of the image (or the z value of the image) */
    depth?: number;
    /** This is the HTMLImageElement that the image is to render. This element MUST be loaded completely before this instance is created. */
    source: ImageInstanceResource;
    /** The height of the image as it is to be rendered in world space */
    height?: number;
    /** The coordinate where the image will be anchored to in world space */
    origin?: Vec2;
    /** Sets the way the image scales with the world */
    scaling?: ScaleMode;
    /** The color the image should render as */
    tint: [number, number, number, number];
    /** The width of the image as it is to be rendered in world space */
    width?: number;
    /**
     * Applies a rotation to the image in radians around the anchor point. ONLY
     * WORKS ON LAYERS THAT SUPPORT IT.
     */
    rotation?: number;
    /** Triggered when it's detected that the image will never render correctly */
    onError?(): void;
    /** Triggered when the image has fully loaded it's resources */
    onReady?(image: ImageInstance, video?: HTMLVideoElement): void;
}
/**
 * This generates a new image instance. There are restrictions surrounding
 * images due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a image via canvas, then rendering it to
 * an Atlas texture which is used to render to cards in the world for rendering.
 * This is highly performant, but means:
 *
 * - Images should only be so large.
 * - Once a image is constructed, only SOME properties can be altered thereafter
 *
 * An image that is constructed can only have some properties set upon creating
 * the image and are locked thereafter. The only way to modify them would be to
 * destroy the image, then construct a new image with the modifications. This
 * has to deal with performance regarding rasterizing the image.
 */
export declare class ImageInstance extends Instance {
    /** This is the rendered color of the image */
    tint: [number, number, number, number];
    /** Depth sorting of the image (or the z value of the image) */
    depth: number;
    /**
     * The height of the image as it is to be rendered in world space. After
     * onReady: this is immediately populated with the width and height of the
     * image as it appears in the atlas.
     */
    height: number;
    /** The coordinate where the image will be located in world space */
    origin: Vec2;
    /** Sets the way the image scales with the world */
    scaling: ScaleMode;
    /** This is where the source of the image will come from */
    source: ImageInstanceResource;
    /**
     * The width of the image as it is to be rendered in world space. After
     * onReady: this is immediately populated with the width and height of the
     * image as it appears in the atlas.
     */
    width: number;
    /**
     * The rotation of the image in radians. This will only be applied if the
     * layer being used specifies support for it. Keep in mind, computing
     * rotations is more costly than AABBs in general.
     */
    rotation: number;
    /**
     * This property reflects the maximum size a single dimension of the image
     * will take up. This means if you set this value to 100 at least the width or
     * the height will be 100 depending on the aspect ratio of the image.
     */
    get maxSize(): number;
    set maxSize(value: number);
    /** Event called when there is an error attempting to load and render the
     * image */
    onError?: IImageInstanceOptions["onError"];
    /** Event called when the instance has it's resource loaded and ready for use
     * */
    onReady?: IImageInstanceOptions["onReady"];
    /** This is the request generated for the instance to retrieve the correct
     * resource */
    request?: IAtlasResourceRequest;
    /** After onReady: This is populated with the width of the source image loaded
     * into the Atlas */
    sourceWidth: number;
    /** After onReady: This is populated with the height of the source image
     * loaded into the Atlas */
    sourceHeight: number;
    /**
     * This is a position relative to the image. This will align the image such
     * that the anchor point on the image will be located at the origin in world
     * space.
     */
    private _anchor;
    constructor(options: IImageInstanceOptions);
    get anchor(): Anchor;
    /**
     * In the event that video auto play is not permitted, one may have to respond
     * to a user input gesture to begin loading and playing the video. While your
     * video is not ready to play, the ImageInstance will NOT fire the onReady
     * callback. Instead it will wait idle as an image that is merely the 'tint
     * color' provided. Once this is called (within a user gesture) the video will
     * for sure start loading, the onReady will call back once the video has
     * properly prepped.
     */
    videoLoad: Function;
    /** This is triggered after the request has been completed */
    resourceTrigger(): void;
    /**
     * This applies a new anchor to this image and properly determines it's anchor
     * position on the image
     */
    setAnchor(anchor: Anchor): void;
}
