import { LabelAtlasResource } from '.';
import { Label } from '../../primitives/label';
export interface ILabelRasterizedMetrics {
    canvas: HTMLCanvasElement;
    height: number;
    width: number;
}
export declare class LabelRasterizer {
    /**
     * This loops until our canvas context is available
     */
    static awaitContext(): Promise<void>;
    /**
     * This renders our label to a sizeable canvas where we loop over the pixel data to determine
     * the bounds of the label.
     *
     * @param {boolean} calculateWorld This is used within the method. It switches from calculating
     *                                 the size to be rendered to the texture to the size the label
     *                                 should be within world space.
     * @param {number} sampleScale     INTERNAL: Do not use this parameter manually.
     */
    static calculateLabelSize(resource: LabelAtlasResource, sampleScale?: number): void;
    /**
     * This generates a canvas that has the cropped version of the label where the label
     * fits neatly in the canvas object.
     */
    static createCroppedCanvas(resource: LabelAtlasResource, top: number, left: number): HTMLCanvasElement;
    /**
     * This retrieves the font size that will be used when rasterizing the label. This takes into
     * account whether the label is requesting super sampling be present for the rendering.
     */
    static getLabelRasterizationFontSize(label: Label, sampleScale: number): number;
    /**
     * Generates the CSS font string based on the label's values
     */
    static makeCSSFont(label: Label, sampleScale: number): string;
    /**
     * Performs the rendering of the label
     */
    static render(resource: LabelAtlasResource): Promise<LabelAtlasResource>;
}
