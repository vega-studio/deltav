import * as Three from "three";
import { Instance } from "../../../instance-provider";
import { Vec2 } from "../../../util";
import { Layer } from "../../layer";
import { Scene } from "../../scene";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
export interface IUniformBufferLocation extends IBufferLocation {
    instanceIndex: number;
    buffer: Three.IUniform;
    range: Vec2;
}
export interface InstanceUniformBuffer {
    activeInstances: boolean[];
    clusters: IUniformBufferLocation[];
    firstInstance: number;
    geometry: Three.BufferGeometry;
    lastInstance: number;
    material: Three.ShaderMaterial;
    model: Three.Object3D;
    pickModel?: Three.Object3D;
}
export declare class UniformBufferManager<T extends Instance> extends BufferManagerBase<T, IUniformBufferLocation> {
    private uniformBlocksPerInstance;
    private buffers;
    private availableClusters;
    private instanceToCluster;
    private clusterToBuffer;
    constructor(layer: Layer<T, any>, scene: Scene);
    add: (instance: T) => any;
    destroy(): void;
    getBufferLocations(instance: T): IUniformBufferLocation;
    getActiveAttributePropertyId(): number;
    getInstanceCount(): number;
    getUpdateAllPropertyIdList(): never[];
    remove: (instance: T) => T;
    removeFromScene(): void;
    setScene(scene: Scene): void;
    makeNewBuffer(): void;
}
