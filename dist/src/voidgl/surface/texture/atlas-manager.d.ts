import { Atlas, IAtlasOptions } from "./atlas";
import { ColorAtlasResource } from "./color-atlas-resource";
import { ImageAtlasResource } from "./image-atlas-resource";
import { LabelAtlasResource } from "./label-atlas-resource";
export declare type AtlasResource = ColorAtlasResource | LabelAtlasResource | ImageAtlasResource;
export declare class AtlasManager {
    allAtlas: Map<string, Atlas>;
    createAtlas(options: IAtlasOptions, resources?: AtlasResource[]): Promise<Atlas>;
    destroy(): void;
    destroyAtlas(atlasName: string): void;
    private setDefaultImage;
    private draw;
    getAtlasTexture(atlasName: string): Atlas | undefined;
    private loadImage;
    updateAtlas(atlasName: string, resources: AtlasResource[]): Promise<void>;
}
