import { Color } from '../../primitives/color';
import { SubTexture } from './sub-texture';
export declare class ColorAtlasResource {
    /** This is the label to be loaded into the atlas */
    color: Color;
    /** This is the rasterization metrics of the color */
    rasterization: {
        canvas?: HTMLCanvasElement;
        height: number;
        width: number;
    };
    /** Once loaded into the texture, this will be populated */
    texture: SubTexture;
    constructor(color: Color);
}
