import { Geometry, Material, Model } from "../../../gl";
import { IMaterialUniform, MaterialUniformType } from "../../../gl/types";
import { Instance } from "../../../instance-provider";
import { Vec2 } from "../../../math";
import { Layer } from "../../layer";
import { LayerScene } from "../../layer-scene";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
export interface IUniformBufferLocation extends IBufferLocation {
    instanceIndex: number;
    buffer: IMaterialUniform<MaterialUniformType.VEC4_ARRAY>;
    range: Vec2;
}
export declare function isUniformBufferLocation(val: any): val is IUniformBufferLocation;
export interface InstanceUniformBuffer {
    activeInstances: boolean[];
    clusters: IUniformBufferLocation[];
    firstInstance: number;
    geometry: Geometry;
    lastInstance: number;
    material: Material;
    model: Model;
}
export declare class UniformBufferManager<T extends Instance> extends BufferManagerBase<T, IUniformBufferLocation> {
    private uniformBlocksPerInstance;
    private buffers;
    private availableClusters;
    private instanceToCluster;
    private clusterToBuffer;
    constructor(layer: Layer<T, any>, scene: LayerScene);
    add: (instance: T) => IUniformBufferLocation | undefined;
    destroy(): void;
    getBufferLocations(instance: T): IUniformBufferLocation;
    getActiveAttributePropertyId(): number;
    getInstanceCount(): number;
    getUpdateAllPropertyIdList(): never[];
    managesInstance(instance: T): boolean;
    remove: (instance: T) => T;
    removeFromScene(): void;
    setScene(scene: LayerScene): void;
    makeNewBuffer(): void;
}