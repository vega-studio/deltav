import { ImageAtlasResource } from "./image-atlas-resource";
export interface IImageRasterizedMetrics {
    canvas: HTMLCanvasElement;
    height: number;
    width: number;
}
export declare class ImageRasterizer {
    static awaitContext(): Promise<void>;
    static getContext(): CanvasRenderingContext2D | null;
    static calculateImageSize(resource: ImageAtlasResource, _sampleScale?: number): void;
    static render(resource: ImageAtlasResource): Promise<ImageAtlasResource>;
    static renderSync(resource: ImageAtlasResource): ImageAtlasResource;
}
