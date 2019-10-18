import { WebGLRenderer } from "../../gl";
import { Atlas, IAtlasResource } from "./atlas";
import { IAtlasResourceRequest } from "./atlas-resource-request";
export declare class AtlasManager {
    allAtlas: Map<string, Atlas>;
    renderer?: WebGLRenderer;
    createAtlas(options: IAtlasResource): Promise<Atlas>;
    destroy(): void;
    destroyAtlas(atlasName: string): void;
    private setDefaultImage;
    private draw;
    getAtlasTexture(resourceId: string): Atlas | undefined;
    private loadImage;
    private repackResources;
    updateAtlas(atlasName: string, requests: IAtlasResourceRequest[]): Promise<Atlas | undefined>;
}
