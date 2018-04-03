import { ImageAtlasResource } from '.';
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
    static getContext(): CanvasRenderingContext2D;
    /**
     * This renders our image to a sizeable canvas where we loop over the pixel data to determine
     * the bounds of the image.
     *
     * @param {boolean} calculateWorld This is used within the method. It switches from calculating
     *                                 the size to be rendered to the texture to the size the image
     *                                 should be within world space.
     * @param {number} sampleScale     INTERNAL: Do not use this parameter manually.
     */
    static calculateImageSize(resource: ImageAtlasResource, sampleScale?: number): void;
    /**
     * Performs the rendering of the image
     */
    static render(resource: ImageAtlasResource): Promise<ImageAtlasResource>;
    /**
     * Performs the rendering of the image
     */
    static renderSync(resource: ImageAtlasResource): ImageAtlasResource;
}
