export interface IImageRasterizedMetrics {
    canvas: HTMLCanvasElement;
    height: number;
    width: number;
}
export declare class ImageRasterizer {
    static awaitContext(): Promise<void>;
    static getContext(): void;
    static calculateImageSize(image: HTMLImageElement): Promise<number[] | undefined>;
    static resizeImage(image: TexImageSource, scale: number): Promise<TexImageSource>;
}
