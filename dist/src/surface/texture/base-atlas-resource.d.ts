import { SubTexture } from "./sub-texture";
export declare class BaseAtlasResource {
    rasterization: {
        canvas?: HTMLCanvasElement;
        image?: HTMLImageElement;
        texture: {
            height: number;
            width: number;
        };
        world: {
            height: number;
            width: number;
        };
    };
    sampleScale: number;
    texture: SubTexture;
}
