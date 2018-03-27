import { Image } from '../../primitives/image';
import { ImageAtlasResource } from '../../surface/texture';
import { IInstanceOptions, Instance } from '../../util/instance';
import { Anchor, ScaleType } from '../types';
export interface IImageInstanceOptions extends IInstanceOptions {
    /**
     * The point on the image which will be placed in world space via the x, y coords. This is also the point
     * which the image will be scaled around.
     */
    anchor?: Anchor;
    /** The color the image should render as */
    color: [number, number, number, number];
    /** Depth sorting of the image (or the z value of the lable) */
    depth?: number;
    /** This allows for control over rasterization to the atlas */
    rasterization?: {
        /**
         * This is the scale of the rasterization on the atlas. Higher numbers increase atlas useage, but can provide
         * higher quality render outputs to the surface.
         */
        scale: number;
    };
    /** Sets the way the image scales with the world */
    scaling?: ScaleType;
    /** The x coordinate where the image will be anchored to in world space */
    x?: number;
    /** The y coordinate where the image will be anchored to in world space */
    y?: number;
}
/**
 * This generates a new image instance which will render a single line of text for a given layer.
 * There are restrictions surrounding images due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a image via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Images should only be so long.
 * - Multiline is not supported inherently
 * - Once a image is constructed, only SOME properties can be altered thereafter
 *
 * A image that is constructed can only have some properties set upon creating the image and are locked
 * thereafter. The only way to modify them would be to destroy the image, then construct a new image
 * with the modifications. This has to deal with performance regarding rasterizing the image
 */
export declare class ImageInstance extends Instance implements Image {
    /** This is the rendered color of the image */
    color: [number, number, number, number];
    /** Depth sorting of the image (or the z value of the lable) */
    depth: number;
    /** Sets the way the image scales with the world */
    scaling: ScaleType;
    /** The x coordinate where the image will be anchored to in world space */
    x: number;
    /** The y coordinate where the image will be anchored to in world space */
    y: number;
    private _width;
    private _height;
    private _isDestroyed;
    private _rasterization;
    private _path;
    private _element;
    /** This is the provided element this image will be rendering */
    readonly element: HTMLImageElement;
    /** This flag indicates if this image is valid anymore */
    readonly isDestroyed: boolean;
    /** This is the path to the image's resource if it's available */
    readonly path: string;
    /** This gets the atlas resource that is uniquely idenfied for this image */
    readonly resource: ImageAtlasResource;
    /**
     * This is the width in world space of the image. If there is no camera distortion,
     * this would be the width of the image in pixels on the screen.
     */
    readonly width: number;
    /**
     * This is the height in world space of the image. If there is no camera distortion,
     * this would be the height of the image in pixels on the screen.
     */
    readonly height: number;
    /** This is the anchor location on the  */
    private _anchor;
    constructor(options: IImageInstanceOptions);
    /**
     * Images are a sort of unique case where the use of a image should be destroyed as rasterization
     * resources are in a way kept alive through reference counting.
     */
    destroy(): void;
    readonly anchor: Anchor;
    /**
     * This applies a new anchor to this image and properly determines it's anchor position on the image
     */
    setAnchor(anchor: Anchor): void;
}
