import { IInstanceAttribute, IQuadTreePickingMetrics, ISinglePickingMetrics } from "../types";
import { Instance } from "../util";
import { InstanceUniformManager, IUniformInstanceCluster } from "../util/instance-uniform-manager";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
export declare type DiffHandler<T extends Instance> = (manager: InstanceDiffManager<T>, instance: T, uniformCluster?: IUniformInstanceCluster) => void;
export declare type DiffLookup<T extends Instance> = DiffHandler<T>[];
export interface IInstanceDiffManagerTarget<T extends Instance> {
    activeAttribute: IInstanceAttribute<T>;
    instanceAttributes: IInstanceAttribute<T>[];
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics;
    resource: AtlasResourceManager;
    uniformManager: InstanceUniformManager<T>;
}
export declare class InstanceDiffManager<T extends Instance> {
    layer: IInstanceDiffManagerTarget<T>;
    quadPicking: IQuadTreePickingMetrics<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>);
    getDiffProcessor(): DiffLookup<T>;
    private addInstance(manager, instance, uniformCluster?);
    private addInstanceQuad(manager, instance, uniformCluster?);
    private changeInstance(manager, instance, uniformCluster?);
    private changeInstanceQuad(manager, instance, uniformCluster?);
    private removeInstance(manager, instance, uniformCluster?);
    private removeInstanceQuad(manager, instance, uniformCluster?);
    private updateInstance(instance, uniformCluster);
}
