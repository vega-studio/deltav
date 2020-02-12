import { Omit } from "../types";
import { GLProxy } from "./gl-proxy";
/**
 * This is the options to apply to a texture
 */
export declare type TextureOptions = Omit<Partial<Texture>, "dispose" | "update" | "updateRegions">;
/**
 * This represents a texture that is loaded into the GPU.
 */
export declare class Texture {
    /** Unique identifier of the texture to aid in debugging and referencing */
    readonly uid: number;
    private _uid;
    /**
     * Anisotropic filtering level. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     * https://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
     */
    anisotropy: Texture["_anisotropy"];
    private _anisotropy;
    /**
     * The data to apply to the GPU for the image. If no data is to be uploaded to the texture,
     * use width and height object. You would do this for render target textures such as depth textures
     * or color buffer textures where the GPU writes the initial data into the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    data: Texture["_data"];
    private _data?;
    /**
     * Indicates the data gets flipped vertically when uploaded to the GPU.
     */
    flipY: boolean;
    private _flipY;
    /**
     * Source format of the input. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    format: Texture["_format"];
    private _format;
    /**
     * Auto generates mipmaps. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
     */
    generateMipMaps: Texture["_generateMipmaps"];
    private _generateMipmaps;
    /**
     * This stores any gl state associated with this object. Modifying this object will cause the system to get out
     * of sync with the GPU; however, the values inside this object can be read and used for custom WebGL calls as needed.
     */
    gl?: {
        /** The identifier used by gl to target this texture. */
        textureId: WebGLTexture | null;
        /** The texture unit this texture is assocviated with. This is -1 if no unit is currently associated */
        textureUnit: number;
        /** This is the proxy communicator with the context that generates and destroys Textures */
        proxy: GLProxy;
    };
    /**
     * Filter used when sampling has to magnify the image see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    magFilter: Texture["_magFilter"];
    private _magFilter;
    /**
     * Filter used when sampling has to shrink the image. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    minFilter: Texture["_minFilter"];
    private _minFilter;
    /** Flag indicates if the texture object needs to have it's data modified */
    needsDataUpload: boolean;
    /** Flag indicates if the texture object has sub texture updates needed to be applied to it */
    needsPartialDataUpload: boolean;
    /** Flag indicates if the texture object needs it's settings modified */
    needsSettingsUpdate: boolean;
    /**
     * Sets the readPixels data alignment. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
     */
    packAlignment: Texture["_packAlignment"];
    private _packAlignment;
    /**
     * Tells the input packing to premultiply the alpha values with the other channels as the texture is generated. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    premultiplyAlpha: Texture["_premultiplyAlpha"];
    private _premultiplyAlpha;
    /**
     * The source pixel data type.
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    type: Texture["_type"];
    private _type;
    /**
     * Sets the data alignment for packing the pixels. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
     */
    unpackAlignment: Texture["_unpackAlignment"];
    private _unpackAlignment;
    /**
     * These are the regions that have been requested to be applied to the Texture along
     * with the data that should be buffered into that region.
     */
    readonly updateRegions: [HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap | ImageData | {
        width: number;
        height: number;
        buffer: ArrayBufferView | null;
    } | undefined, {
        x: number;
        y: number;
        width: number;
        height: number;
    }][];
    private _updateRegions;
    /**
     * Specifies sample wrapping for when samples fall outside the 0 - 1 range See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    wrapHorizontal: Texture["_wrapHorizontal"];
    private _wrapHorizontal;
    /**
     * Specifies sample wrapping for when samples fall outside the 0 - 1 range. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    wrapVertical: Texture["_wrapVertical"];
    private _wrapVertical;
    constructor(options: TextureOptions);
    /**
     * Frees resources associated with this texture.
     */
    dispose(): void;
    /**
     * Clears all update flags and clears out requested updates to the texture object.
     *
     * NOTE: Calling this does not perform any actions, but instead prevents actions from
     * being taken again. The system uses this to clear up any changes requested for the texture
     * after the texture has been updated with the GPU.
     */
    resolve(): void;
    /**
     * This updates a portion of the texture object.
     */
    update(data: Texture["data"], region: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
}
