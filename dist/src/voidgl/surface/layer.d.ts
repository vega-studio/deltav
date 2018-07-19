import * as Three from "three";
import { IInstanceAttribute, IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, InstanceHitTest, InstanceIOValue, IPickInfo, IQuadTreePickingMetrics, IShaders, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, PickType, ShaderInjectionTarget, UniformIOValue, UniformSize } from "../types";
import { BoundsAccessor, DataProvider, DiffType } from "../util";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { Instance } from "../util/instance";
import { InstanceUniformManager } from "../util/instance-uniform-manager";
import { DiffLookup, InstanceDiffManager } from "./instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerSurface } from "./layer-surface";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
import { View } from "./view";
export interface IShaderInputs<T extends Instance> {
    instanceAttributes?: (IInstanceAttribute<T> | null)[];
    vertexAttributes?: (IVertexAttribute | null)[];
    vertexCount: number;
    uniforms?: (IUniform | null)[];
}
export declare type IShaderInitialization<T extends Instance> = IShaderInputs<T> & IShaders;
export interface IModelType {
    drawMode?: Three.TrianglesDrawModes;
    modelType: IModelConstructable;
}
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    data: DataProvider<T>;
    picking?: PickType;
    scene?: string;
    onMouseDown?(info: IPickInfo<T>): void;
    onMouseMove?(info: IPickInfo<T>): void;
    onMouseOut?(info: IPickInfo<T>): void;
    onMouseOver?(info: IPickInfo<T>): void;
    onMouseUp?(info: IPickInfo<T>): void;
    onMouseClick?(info: IPickInfo<T>): void;
}
export interface IModelConstructable {
    new (geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material[]): any;
}
export interface IPickingMethods<T extends Instance> {
    boundsAccessor: BoundsAccessor<T>;
    hitTest: InstanceHitTest<T>;
}
export declare class Layer<T extends Instance, U extends ILayerProps<T>> extends IdentifyByKey {
    static defaultProps: any;
    activeAttribute: IInstanceAttribute<T>;
    depth: number;
    geometry: Three.BufferGeometry;
    instanceAttributes: IInstanceAttribute<T>[];
    instanceById: Map<string, T>;
    instanceVertexCount: number;
    interactions: LayerInteractionHandler<T, U>;
    material: Three.RawShaderMaterial;
    maxInstancesPerBuffer: number;
    model: Three.Object3D;
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics;
    props: U;
    resource: AtlasResourceManager;
    surface: LayerSurface;
    uniforms: IUniformInternal[];
    uniformManager: InstanceUniformManager<T>;
    vertexAttributes: IVertexAttributeInternal[];
    view: View;
    diffManager: InstanceDiffManager<T>;
    diffProcessor: DiffLookup<T>;
    constructor(props: ILayerProps<T>);
    destroy(): void;
    didUpdateProps(): void;
    draw(): void;
    getInstancePickingMethods(): IPickingMethods<T>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
    initShader(): IShaderInitialization<T>;
    makeInstanceAttribute(block: number, blockIndex: InstanceBlockIndex, name: string, size: InstanceAttributeSize, update: (o: T) => InstanceIOValue, atlas?: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    }): IInstanceAttribute<T>;
    makeUniform(name: string, size: UniformSize, update: (o: IUniform) => UniformIOValue, shaderInjection?: ShaderInjectionTarget, qualifier?: string): IUniform;
    willUpdateInstances(_changes: [T, DiffType]): void;
    willUpdateProps(_newProps: ILayerProps<T>): void;
    didUpdate(): void;
}
