import { Color } from '../../primitives/color';
import { BaseAtlasResource } from './base-atlas-resource';
export declare class ColorAtlasResource extends BaseAtlasResource {
    /** This is the color to be loaded into the atlas */
    color: Color;
    constructor(color: Color);
}
