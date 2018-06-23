import { IInstanceAttribute, INonePickingMetrics, IQuadTreePickingMetrics, ISinglePickingMetrics } from '../types';
import { Instance } from '../util';
import { InstanceUniformManager, IUniformInstanceCluster } from '../util/instance-uniform-manager';
import { AtlasResourceManager } from './texture/atlas-resource-manager';
/** Signature of a method that handles a diff */
export declare type DiffHandler<T extends Instance> = (manager: InstanceDiffManager<T>, instance: T, uniformCluster: IUniformInstanceCluster) => void;
/** A set of diff handling methods in this order [change, add, remove] */
export declare type DiffLookup<T extends Instance> = DiffHandler<T>[];
/**
 * This interface is the bare minimum properties needed for this diff manager to map instance updates to
 * uniform changes. We don't use a Layer as a target explicitly to avoid circular/hard dependencies
 */
export interface IInstanceDiffManagerTarget<T extends Instance> {
    /** This is the attribute for the target that represents the _active injected value */
    activeAttribute: IInstanceAttribute<T>;
    /** This is all of the instance attributes applied to the target */
    instanceAttributes: IInstanceAttribute<T>[];
    /** This is the picking metrics for how Instances are picked with the mouse */
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
    /** This is the resource manager for the target which let's us fetch information from an atlas for an instance */
    resource: AtlasResourceManager;
    /** This is the manager that links an instance to it's uniform cluster for populating the uniform buffer */
    uniformManager: InstanceUniformManager<T>;
}
/**
 * This class manages the process of taking the diffs of a layer and executing methods on those diffs to perform
 * updates to the uniforms that control those instances.
 */
export declare class InstanceDiffManager<T extends Instance> {
    layer: IInstanceDiffManagerTarget<T>;
    quadPicking: IQuadTreePickingMetrics<T>;
    colorPicking: ISinglePickingMetrics<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>);
    /**
     * This returns the proper diff processor for handling diffs
     */
    getDiffProcessor(): DiffLookup<T>;
    /**
     * This processes add operations from changes in the instancing data
     */
    private addInstance(manager, instance, uniformCluster);
    /**
     * This processes add operations from changes in the instancing data and manages the layer's quad tree
     * with the instance as well.
     */
    private addInstanceQuad(manager, instance, uniformCluster);
    /**
     * This processes add operations from changes in the instancing data and manages the layer's matching of
     * color / UID to Instance
     */
    private addInstanceColorPick(manager, instance, uniformCluster);
    /**
     * This processes change operations from changes in the instancing data
     */
    private changeInstance(manager, instance, uniformCluster);
    /**
     * This processes change operations from changes in the instancing data
     */
    private changeInstanceQuad(manager, instance, uniformCluster);
    /**
     * This processes change operations from changes in the instancing data
     */
    private changeInstanceColorPick(manager, instance, uniformCluster);
    /**
     * This processes remove operations from changes in the instancing data
     */
    private removeInstance(manager, instance, uniformCluster);
    /**
     * This processes remove operations from changes in the instancing data
     */
    private removeInstanceQuad(manager, instance, uniformCluster);
    /**
     * This processes remove operations from changes in the instancing data
     */
    private removeInstanceColorPick(manager, instance, uniformCluster);
    private updateInstance(instance, uniformCluster);
}
