import * as Three from "three";
import { IPoint } from "../../primitives/point";
export declare class SubTexture {
    aspectRatio: number;
    atlasReferenceID: string;
    atlasTexture: Three.Texture | null;
    atlasTL: IPoint;
    atlasTR: IPoint;
    atlasBL: IPoint;
    atlasBR: IPoint;
    widthOnAtlas: number;
    heightOnAtlas: number;
    isValid: boolean;
    pixelWidth: number;
    pixelHeight: number;
}
