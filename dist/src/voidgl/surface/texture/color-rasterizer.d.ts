import { ColorAtlasResource } from '.';
import { Color } from '../../primitives/color';
/**
 * Static class for rasterizing a color to a canvas object
 */
export declare class ColorRasterizer {
    /**
     * This loops until our canvas context is available
     */
    static awaitContext(canvas: HTMLCanvasElement): Promise<void>;
    /**
     * Generates the CSS string version of the color
     */
    static makeCSS(color: Color): string;
    static render(resource: ColorAtlasResource): Promise<ColorAtlasResource>;
}
