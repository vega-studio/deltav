import { Image } from '../../primitives/image';
import { BaseAtlasResource } from './base-atlas-resource';
export declare class ImageAtlasResource extends BaseAtlasResource {
    /** This is the image to be loaded into the atlas */
    image: Image;
    constructor(image: Image);
}
