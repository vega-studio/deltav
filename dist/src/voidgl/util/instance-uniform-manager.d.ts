import * as Three from "three";
import { Layer } from "../surface/layer";
import { Scene } from "../surface/scene";
import { Instance } from "./instance";
export interface IUniformInstanceCluster {
    instanceIndex: number;
    uniform: Three.IUniform;
    uniformRange: [number, number];
}
export interface InstanceUniformBuffer {
    activeInstances: boolean[];
    clusters: IUniformInstanceCluster[];
    firstInstance: number;
    geometry: Three.BufferGeometry;
    lastInstance: number;
    material: Three.ShaderMaterial;
    model: Three.Object3D;
}
export declare class InstanceUniformManager<T extends Instance> {
    private layer;
    private scene;
    private uniformBlocksPerInstance;
    private buffers;
    private availableClusters;
    private instanceToCluster;
    private clusterToBuffer;
    constructor(layer: Layer<T, any>, scene: Scene);
    add(instance: T): IUniformInstanceCluster | undefined;
    destroy(): void;
    getUniforms(instance: T): IUniformInstanceCluster | undefined;
    remove(instance: T): IUniformInstanceCluster | undefined;
    removeFromScene(): void;
    setScene(scene: Scene): void;
    private makeNewBuffer();
}
