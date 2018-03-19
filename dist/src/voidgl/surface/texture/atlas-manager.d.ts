import { ImageAtlasResource, LabelAtlasResource } from '.';
import { Atlas, IAtlasOptions } from './atlas';
import { ColorAtlasResource } from './color-atlas-resource';
export declare type AtlasResource = ColorAtlasResource | LabelAtlasResource | ImageAtlasResource;
/**
 * Defines a manager of atlas', which includes generating the atlas and producing
 * textures defining those pieces of atlas.
 */
export declare class AtlasManager {
    /** Stores all of the generated atlas' in a lookup by name */
    allAtlas: Map<string, Atlas>;
    /**
     * Atlas' must be created from scratch to update them. In order to properly
     * update an existing one, you must destroy it then recreate it again.
     * This is from not knowing how to update a texture via three js.
     *
     * @param resources The images with their image path set to be loaded into the atlas.
     *               Images that keep an atlas ID of null indicates the image did not load
     *               correctly
     *
     * @return {Texture} The Threejs texture that is created as our atlas. The images injected
     *                   into the texture will be populated with the atlas'
     */
    createAtlas(options: IAtlasOptions, resources?: AtlasResource[]): Promise<Atlas>;
    /**
     * Disposes of the resources the atlas held and makes the atlas invalid for use
     *
     * @param atlasName
     */
    destroyAtlas(atlasName: string): void;
    private setDefaultImage(image, atlasName);
    /**
     * This loads, packs, and draws the indicated image into the specified canvas
     * using the metrics that exists for the specified atlas.
     *
     * @param resource The image who should have it's image path loaded
     * @param atlasName The name of the atlas to make the packing work
     * @param canvas The canvas we will be drawing into to generate the complete image
     *
     * @return {Promise<boolean>} Promise that resolves to if the image successfully was drawn or not
     */
    private draw(atlas, resource);
    /**
     * Retrieves the threejs texture for the atlas
     *
     * @param atlasName The identifier of the atlas
     */
    getAtlasTexture(atlasName: string): Atlas | undefined;
    /**
     * This takes in any atlas resource and rasterizes it.
     *
     * @param {SubTexture} resource This is any atlas resource which will have it's image rasterized
     *
     * @return {Promise<HTMLImageElement>} A promise to resolve to the loaded image
     *                                     or null if there was an error
     */
    private loadImage(resource);
    /**
     * This targets an existing atlas and attempts to update it with the provided atlas resources.
     *
     * @param atlasName
     * @param resources
     */
    updateAtlas(atlasName: string, resources: AtlasResource[]): Promise<void>;
}
