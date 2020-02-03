import { Texture } from "../../gl/texture";
import { Bounds } from "../../math/primitives/bounds";
import { Vec2 } from "../../math/vector";
import { InstanceIOValue, Omit } from "../../types";
import { VideoTextureMonitor } from "./video-texture-monitor";
/**
 * Converts a SubTexture reference to a valid Instance IO value where:
 * [top left x, top left y, bottom right x, bottom right y]
 *
 * This also handles falsey texture values where invalid is a zero vector
 */
export declare function subTextureIOValue(texture?: SubTexture | null): InstanceIOValue;
/**
 * Defines a texture that is located on an atlas
 */
export declare class SubTexture {
    /** A unique identifier for the sub texture to aid in debugging issues */
    readonly uid: number;
    private _uid;
    /** Stores the aspect ratio of the image for quick reference */
    aspectRatio: number;
    /** This is the top left UV coordinate of the sub texture on the atlas */
    atlasTL: Vec2;
    /** This is the top right UV coordinate of the sub texture on the atlas */
    atlasTR: Vec2;
    /** This is the bottom left UV coordinate of the sub texture on the atlas */
    atlasBL: Vec2;
    /** This is the bottom right UV coordinate of the sub texture on the atlas */
    atlasBR: Vec2;
    /** This is the normalized height of the sub texture on the atlas */
    heightOnAtlas: number;
    /** This flag is set to false when the underlying texture is no longer valid */
    isValid: boolean;
    /** Width in pixels of the image on the atlas */
    pixelWidth: number;
    /** Height in pixels of the image on the atlas */
    pixelHeight: number;
    /** The region information of the subtexture on the atlas' texture. */
    atlasRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** This is the source image/data that this sub texture applied to the atlas */
    source?: TexImageSource;
    /** This is the actual texture this resource is located within */
    texture: Texture | null;
    /**
     * If this is a subtexture that references a video, this will be populated with it's monitor that ensures the portion
     * of the texture is kept up to date with the latest from the video's playback.
     */
    video?: {
        monitor: VideoTextureMonitor;
    };
    /** This is the normalized width of the sub texture on the atlas */
    widthOnAtlas: number;
    constructor(options?: Omit<Partial<SubTexture>, "update">);
    /**
     * Generates a SubTexture object based on the texture and region provided.
     */
    static fromRegion(source: Texture, region: Bounds<any>): SubTexture | null;
    /**
     * Forces an update of this sub texture on the texture it is located.
     *
     * NOTE: Use this WISELY. This does NOT smartly determine if the update would do nothing. This WILL cause the source
     * to be uploaded to the Atlas when this is called.
     */
    update(): void;
    toString(): string;
}
