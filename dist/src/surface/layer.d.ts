import { Geometry } from "../gl/geometry";
import { Material } from "../gl/material";
import { Model } from "../gl/model";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import { ResourceManager } from "../resources";
import { IInstanceAttribute, ILayerMaterialOptions, INonePickingMetrics, InstanceAttributeSize, InstanceBlockIndex, InstanceDiffType, InstanceHitTest, InstanceIOValue, IPickInfo, IQuadTreePickingMetrics, IShaderInitialization, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttributeInternal, PickType, ShaderInjectionTarget, UniformIOValue, UniformSize } from "../types";
import { BoundsAccessor } from "../util";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { BufferManagerBase, IBufferLocation } from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerBufferType } from "./layer-processing/layer-buffer-type";
import { LayerInitializer, LayerSurface } from "./layer-surface";
import { View } from "./view";
export interface IInstanceProvider<T extends Instance> {
    resolveContext: string;
    uid: number;
    changeList: InstanceDiff<T>[];
    remove(instance: T): void;
    resolve(context: string): void;
    sync(): void;
}
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    data: IInstanceProvider<T>;
    materialOptions?: ILayerMaterialOptions;
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
export interface ILayerPropsInternal<T extends Instance> extends ILayerProps<T> {
    parent?: Layer<Instance, ILayerProps<Instance>>;
}
export interface IPickingMethods<T extends Instance> {
    boundsAccessor: BoundsAccessor<T>;
    hitTest: InstanceHitTest<T>;
}
export declare class Layer<T extends Instance, U extends ILayerProps<T>> extends IdentifyByKey {
    static defaultProps: any;
    activeAttribute: IInstanceAttribute<T>;
    animationEndTime: number;
    private _bufferManager;
    readonly bufferManager: BufferManagerBase<T, IBufferLocation>;
    private _bufferType;
    readonly bufferType: LayerBufferType;
    children?: Layer<Instance, ILayerProps<Instance>>[];
    depth: number;
    diffManager: InstanceDiffManager<T>;
    easingId: {
        [key: string]: number;
    };
    geometry: Geometry;
    initializer: LayerInitializer;
    instanceAttributes: IInstanceAttribute<T>[];
    instanceVertexCount: number;
    interactions: LayerInteractionHandler<T, U>;
    lastFrameTime: number;
    material: Material;
    maxInstancesPerBuffer: number;
    model: Model;
    needsViewDrawn: boolean;
    parent?: Layer<Instance, ILayerProps<Instance>>;
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
    props: U;
    resource: ResourceManager;
    surface: LayerSurface;
    uniforms: IUniformInternal[];
    readonly uid: number;
    private _uid;
    vertexAttributes: IVertexAttributeInternal[];
    view: View;
    willRebuildLayer: boolean;
    constructor(props: ILayerProps<T>);
    baseShaderModules(shaderIO: IShaderInitialization<T>): {
        fs: string[];
        vs: string[];
    };
    childLayers(): LayerInitializer[];
    destroy(): void;
    didUpdateProps(): void;
    draw(): void;
    getInstanceObservableIds<K extends keyof T>(instance: T, properties: Extract<K, string>[]): {
        [key: string]: number;
    };
    getInstancePickingMethods(): IPickingMethods<T>;
    getMaterialOptions(): ILayerMaterialOptions;
    initShader(): IShaderInitialization<T> | null;
    makeInstanceAttribute(block: number, blockIndex: InstanceBlockIndex, name: string, size: InstanceAttributeSize, update: (o: T) => InstanceIOValue, resource?: {
        type: number;
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    }): IInstanceAttribute<T>;
    makeUniform(name: string, size: UniformSize, update: (o: IUniform) => UniformIOValue, shaderInjection?: ShaderInjectionTarget, qualifier?: string): IUniform;
    managesInstance(instance: T): boolean;
    rebuildLayer(): void;
    resolveChanges(preserveProvider?: boolean): [T, InstanceDiffType, {
        [key: number]: number;
    }][];
    setBufferManager(bufferManager: BufferManagerBase<T, IBufferLocation>): void;
    setBufferType(val: LayerBufferType): void;
    shouldDrawView(oldProps: U, newProps: U): boolean;
    updateUniforms(): void;
    willUpdateInstances(_changes: [T, InstanceDiffType]): void;
    willUpdateProps(_newProps: ILayerProps<T>): void;
}
