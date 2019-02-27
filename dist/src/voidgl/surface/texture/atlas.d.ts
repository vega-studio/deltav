import * as Three from "three";
import { IdentifyByKey, IdentifyByKeyOptions } from "../../util/identify-by-key";
import { AtlasManager, AtlasResource } from "./atlas-manager";
import { PackNode } from "./pack-node";
export declare enum AtlasSize {
    _2 = 2,
    _4 = 4,
    _8 = 8,
    _16 = 16,
    _32 = 32,
    _64 = 64,
    _128 = 128,
    _256 = 256,
    _512 = 512,
    _1024 = 1024,
    _2048 = 2048,
    _4096 = 4096
}
export interface IAtlasOptions extends IdentifyByKeyOptions {
    height: AtlasSize;
    width: AtlasSize;
    textureSettings?: Partial<Three.Texture>;
}
export declare class Atlas extends IdentifyByKey {
    height: AtlasSize;
    manager: AtlasManager;
    packing: PackNode;
    texture: Three.Texture;
    textureSettings?: Partial<Three.Texture>;
    validResources: Set<AtlasResource>;
    width: AtlasSize;
    constructor(options: IAtlasOptions);
    private invalidateResource;
    setManager(manager: AtlasManager): void;
    registerResource(resource: AtlasResource): boolean;
    removeResource(resource: AtlasResource): void;
    updateTexture(canvas?: HTMLCanvasElement): void;
    destroy(): void;
}
