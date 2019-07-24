import { Texture } from "../../gl/texture";
import { Bounds } from "../../math/primitives/bounds";
import { Vec2 } from "../../math/vector";
import { InstanceIOValue, Omit } from "../../types";
import { VideoTextureMonitor } from "./video-texture-monitor";
export declare function subTextureIOValue(texture?: SubTexture | null): InstanceIOValue;
export declare class SubTexture {
    readonly uid: number;
    private _uid;
    aspectRatio: number;
    atlasTL: Vec2;
    atlasTR: Vec2;
    atlasBL: Vec2;
    atlasBR: Vec2;
    heightOnAtlas: number;
    isValid: boolean;
    pixelWidth: number;
    pixelHeight: number;
    atlasRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    source?: TexImageSource;
    texture: Texture | null;
    video?: {
        monitor: VideoTextureMonitor;
    };
    widthOnAtlas: number;
    constructor(options?: Omit<Partial<SubTexture>, "update">);
    static fromRegion(source: Texture, region: Bounds<any>): SubTexture | null;
    update(): void;
    toString(): string;
}
