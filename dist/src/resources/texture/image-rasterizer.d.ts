export interface IImageRasterizedMetrics {
    canvas: HTMLCanvasElement;
    height: number;
    width: number;
}
export declare class ImageRasterizer {
    /**
     * This loops until our canvas context is available
     */
    static awaitContext(): Promise<void>;
    /**
     * Attempts to populate the 'canvas' context for rendering images offscreen.
     */
    static getContext(): void;
    /**
     * This ensures an image is renderable at the current moment. This draws the image to a canvas partially
     * to help the image 'warm up' within some browser contexts to ensure the image can be used as a drawable item.
     */
    static calculateImageSize(image: HTMLImageElement): Promise<number[] | undefined>;
    /**
     * This resizes the input image by the provided scale.
     */
    static resizeImage(image: TexImageSource, scale: number): Promise<TexImageSource>;
}
