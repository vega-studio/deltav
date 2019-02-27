import { GLProxy } from "./gl-proxy";
export declare class Texture {
    anisotropy: Texture["_anisotropy"];
    private _anisotropy;
    data: Texture["_data"];
    private _data?;
    format: Texture["_format"];
    private _format;
    generateMipmaps: Texture["_generateMipmaps"];
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
    needsSettingsUpdate: boolean;
    packAlignment: Texture["_packAlignment"];
    private _packAlignment;
    premultiplyAlpha: Texture["_premultiplyAlpha"];
    private _premultiplyAlpha;
    type: Texture["_type"];
    private _type;
    unpackAlignment: Texture["_unpackAlignment"];
    private _unpackAlignment;
    wrapHorizontal: Texture["_wrapHorizontal"];
    private _wrapHorizontal;
    wrapVertical: Texture["_wrapVertical"];
    private _wrapVertical;
    constructor(options: Partial<Texture>);
    dispose(): void;
}
