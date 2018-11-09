import * as Three from "three";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import { IInstanceAttribute, IMaterialOptions, INonePickingMetrics, InstanceAttributeSize, InstanceBlockIndex, InstanceDiffType, InstanceHitTest, InstanceIOValue, IPickInfo, IQuadTreePickingMetrics, IShaderInitialization, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttributeInternal, PickType, ShaderInjectionTarget, UniformIOValue, UniformSize } from "../types";
import { BoundsAccessor } from "../util";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { BufferManagerBase, IBufferLocation } from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerBufferType } from "./layer-processing/layer-buffer-type";
import { LayerInitializer, LayerSurface } from "./layer-surface";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
import { View } from "./view";
export interface IModelType {
    drawMode?: Three.TrianglesDrawModes;
    modelType: IModelConstructable;
}
export interface IInstanceProvider<T extends Instance> {
    changeList: InstanceDiff<T>[];
    resolve(): void;
    sync(): void;
}
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    data: IInstanceProvider<T>;
    picking?: PickType;
    printShader?: boolean;
    scene: string;
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
    private _bufferManager;
    readonly bufferManager: BufferManagerBase<T, IBufferLocation>;
    private _bufferType;
    readonly bufferType: LayerBufferType;
    depth: number;
    diffManager: InstanceDiffManager<T>;
    easingId: {
        [key: string]: number;
    };
    geometry: Three.BufferGeometry;
    initializer: LayerInitializer;
    instanceAttributes: IInstanceAttribute<T>[];
    instanceById: Map<string, T>;
    instanceVertexCount: number;
    interactions: LayerInteractionHandler<T, U>;
    material: Three.RawShaderMaterial;
    maxInstancesPerBuffer: number;
    model: Three.Object3D;
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
    props: U;
    resource: AtlasResourceManager;
    surface: LayerSurface;
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
    view: View;
    needsViewDrawn: boolean;
    animationEndTime: number;
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
    setBufferManager(bufferManager: BufferManagerBase<T, IBufferLocation>): void;
    setBufferType(val: LayerBufferType): void;
    shouldDrawView(oldProps: U, newProps: U): boolean;
    willUpdateInstances(_changes: [T, InstanceDiffType]): void;
    willUpdateProps(_newProps: ILayerProps<T>): void;
    didUpdate(): void;
}
