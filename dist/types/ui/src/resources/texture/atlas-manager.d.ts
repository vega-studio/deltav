import { Atlas, IAtlasResource } from "./atlas";
import { WebGLRenderer } from "../../gl";
import { IAtlasResourceRequest } from "./atlas-resource-request";
/**
 * Defines a manager of atlas', which includes generating the atlas and
 * producing textures defining those pieces of atlas.
 */
export declare class AtlasManager {
    /** Stores all of the generated atlas' in a lookup by name */
    allAtlas: Map<string, Atlas>;
    /**
     * This will be the renderer this manager is acting on behalf. This is used
     * internally to perform some GL actions without messing up the sync state of
     * the gl context with the renderer.
     */
    renderer?: WebGLRenderer;
    /**
     * Creates a new atlas that resources can be loaded into.
     *
     * @param resources The images with their image path set to be loaded into the
     *               atlas. Images that keep an atlas ID of null indicates the
     *               image did not load correctly
     *
     * @return {Texture} The texture that is created as our atlas. The images
     *                   injected into the texture will be populated with the
     *                   atlas'
     */
    createAtlas(options: IAtlasResource): Promise<Atlas>;
    /**
     * Free ALL resources under this manager
     */
    destroy(): void;
    /**
     * Disposes of the resources the atlas held and makes the atlas invalid for
     * use
     *
     * @param atlasName
     */
    destroyAtlas(atlasName: string): void;
    private setDefaultImage;
    /**
     * This loads, packs, and draws the indicated image into the specified canvas
     * using the metrics that exists for the specified atlas.
     *
     * @param request The image who should have it's image path loaded
     * @param atlasName The name of the atlas to make the packing work
     * @param canvas The canvas we will be drawing into to generate the complete
     * image
     *
     * @return {Promise<boolean>} Promise that resolves to if the image
     * successfully was drawn or not
     */
    private draw;
    /**
     * Retrieves the actual Atlas object for a given resource id
     */
    getAtlasTexture(resourceId: string): Atlas | undefined;
    /**
     * This takes in any atlas resource and ensures the image is available and
     * ready to render.
     */
    private loadImage;
    /**
     * When this is triggered, the atlas will examine all of it's packing and
     * repack it's resources on the texture for the atlas thus eliminating any
     * dead space from resources that have been disposed.
     *
     * This process will cause the atlas to generate a new Texture to utilize and
     * dispose of the old texture to allow for the atlas to redraw it's texture
     * using GPU operations which is much faster than a CPU operation of
     * generating the texture.
     */
    private repackResources;
    /**
     * This targets an existing atlas and attempts to update it with the provided
     * atlas resources.
     */
    updateAtlas(atlasName: string, requests: IAtlasResourceRequest[]): Promise<Atlas | undefined>;
}
