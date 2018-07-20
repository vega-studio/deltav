import * as Three from "three";
import { Instance } from "../../instance-provider/instance";
import { InstanceIOValue } from "../../types";
import { ILayerProps, Layer } from "../layer";
import { AtlasManager, AtlasResource } from "./atlas-manager";
export interface IAtlasResourceManagerOptions {
    atlasManager: AtlasManager;
}
export declare class AtlasResourceManager {
    atlasManager: AtlasManager;
    targetAtlas: string;
    private requestQueue;
    private requestLookup;
    constructor(options: IAtlasResourceManagerOptions);
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    getAtlasTexture(key: string): Three.Texture | null;
    request<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instance: Instance, resource: AtlasResource): InstanceIOValue;
    setTargetAtlas(target: string): void;
}
