import { Texture } from "../../gl/texture";
import { Bounds } from "../../math/primitives/bounds";
import { InstanceIOValue } from "../../types";
import { Vec2 } from "../../util/vector";
export declare function subTextureIOValue(texture?: SubTexture | null): InstanceIOValue;
export declare class SubTexture {
    aspectRatio: number;
    atlasTL: Vec2;
    atlasTR: Vec2;
    atlasBL: Vec2;
    atlasBR: Vec2;
    heightOnAtlas: number;
    isValid: boolean;
    pixelWidth: number;
    pixelHeight: number;
    textureReferenceID: string;
    texture: Texture | null;
    widthOnAtlas: number;
    static fromRegion(source: Texture, region: Bounds<any>): SubTexture | null;
}
