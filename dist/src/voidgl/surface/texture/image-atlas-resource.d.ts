import { Image } from '../../primitives/image';
import { SubTexture } from './sub-texture';
export declare class ImageAtlasResource {
    /** This is the label to be loaded into the atlas */
    image: Image;
    /** Once loaded into the texture, this will be populated */
    texture: SubTexture;
    constructor(image: Image);
}
