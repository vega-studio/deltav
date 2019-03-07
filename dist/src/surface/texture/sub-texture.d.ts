import { Texture } from "../../gl/texture";
import { Vec2 } from "../../util/vector";
export declare class SubTexture {
    aspectRatio: number;
    atlasReferenceID: string;
    atlasTexture: Texture | null;
    atlasTL: Vec2;
    atlasTR: Vec2;
    atlasBL: Vec2;
    atlasBR: Vec2;
    widthOnAtlas: number;
    heightOnAtlas: number;
    isValid: boolean;
    pixelWidth: number;
    pixelHeight: number;
}