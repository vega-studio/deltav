import { Color } from "../../primitives/color";
import { ColorAtlasResource } from "./color-atlas-resource";
export declare class ColorRasterizer {
    static awaitContext(canvas: HTMLCanvasElement): Promise<void>;
    static makeCSS(color: Color): string;
    static render(resource: ColorAtlasResource): Promise<ColorAtlasResource>;
}
