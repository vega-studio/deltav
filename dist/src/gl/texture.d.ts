import { Omit } from "../types";
import { GLProxy } from "./gl-proxy";
export declare type TextureOptions = Omit<Partial<Texture>, "dispose" | "update" | "updateRegions">;
export declare class Texture {
    anisotropy: Texture["_anisotropy"];
    private _anisotropy;
    data: Texture["_data"];
    private _data?;
    flipY: boolean;
    private _flipY;
    format: Texture["_format"];
    private _format;
    generateMipMaps: Texture["_generateMipmaps"];
    private _generateMipmaps;
    gl?: {
        textureId: WebGLTexture | null;
        textureUnit: number;
        proxy: GLProxy;
    };
    magFilter: Texture["_magFilter"];
    private _magFilter;
    minFilter: Texture["_minFilter"];
    private _minFilter;
    needsDataUpload: boolean;
    needsPartialDataUpload: boolean;
    needsSettingsUpdate: boolean;
    packAlignment: Texture["_packAlignment"];
    private _packAlignment;
    premultiplyAlpha: Texture["_premultiplyAlpha"];
    private _premultiplyAlpha;
    type: Texture["_type"];
    private _type;
    unpackAlignment: Texture["_unpackAlignment"];
    private _unpackAlignment;
    readonly updateRegions: [HTMLCanvasElement | ImageBitmap | ImageData | HTMLImageElement | HTMLVideoElement | {
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
    wrapHorizontal: Texture["_wrapHorizontal"];
    private _wrapHorizontal;
    wrapVertical: Texture["_wrapVertical"];
    private _wrapVertical;
    constructor(options: TextureOptions);
    dispose(): void;
    resolve(): void;
    update(data: Texture["data"], region: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
}
