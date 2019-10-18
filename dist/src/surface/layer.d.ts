import { Geometry } from "../gl/geometry";
import { Material } from "../gl/material";
import { Model } from "../gl/model";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import { ResourceRouter } from "../resources";
import { IInstanceAttribute, ILayerMaterialOptions, INonePickingMetrics, IPickInfo, IShaderInitialization, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, LayerBufferType, Omit, PickType } from "../types";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { BufferManagerBase, IBufferLocation } from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";
import { IViewProps, View } from "./view";
export interface ILayerConstructable<T extends Instance> {
    new (surface: Surface, scene: LayerScene, props: ILayerProps<T>): Layer<any, any>;
}
export declare type ILayerConstructionClass<T extends Instance, U extends ILayerProps<T>> = ILayerConstructable<T> & {
    defaultProps: U;
};
export declare type LayerInitializer = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerProps<Instance>>, ILayerProps<Instance>];
};
export declare type LayerInitializerInternal = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>, ILayerPropsInternal<Instance>];
};
export declare function createAttribute<T extends Instance>(options: IInstanceAttribute<T>): IInstanceAttribute<T>;
export declare function createUniform(options: IUniform): IUniform;
export declare function createVertex(options: IVertexAttribute): IVertexAttribute;
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
export interface IInstanceProvider<T extends Instance> {
    resolveContext: string;
    uid: number;
    changeList: InstanceDiff<T>[];
    remove(instance: T): void;
    resolve(context: string): void;
    sync(): void;
}
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    baseShaderModules?(shaderIO: IShaderInitialization<T>, layerModules: {
        fs: string[];
        vs: string[];
    }): {
        fs: string[];
        vs: string[];
    };
    data: IInstanceProvider<T>;
    materialOptions?: ILayerMaterialOptions;
    order?: number;
    picking?: PickType;
    printShader?: boolean;
    onMouseDown?(info: IPickInfo<T>): void;
    onMouseMove?(info: IPickInfo<T>): void;
    onMouseOut?(info: IPickInfo<T>): void;
    onMouseOver?(info: IPickInfo<T>): void;
    onMouseUp?(info: IPickInfo<T>): void;
    onMouseUpOutside?(info: IPickInfo<T>): void;
    onMouseClick?(info: IPickInfo<T>): void;
    onTouchAllEnd?(info: IPickInfo<T>): void;
    onTouchDown?(info: IPickInfo<T>): void;
    onTouchUp?(info: IPickInfo<T>): void;
    onTouchUpOutside?(info: IPickInfo<T>): void;
    onTouchMove?(info: IPickInfo<T>): void;
    onTouchOut?(info: IPickInfo<T>): void;
    onTouchOver?(info: IPickInfo<T>): void;
    onTouchAllOut?(info: IPickInfo<T>): void;
    onTap?(info: IPickInfo<T>): void;
}
export interface ILayerPropsInternal<T extends Instance> extends ILayerProps<T> {
    parent?: Layer<Instance, ILayerProps<Instance>>;
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
    order?: number;
    parent?: Layer<Instance, ILayerProps<Instance>>;
    picking: ISinglePickingMetrics<T> | INonePickingMetrics;
    props: U;
    resource: ResourceRouter;
    scene: LayerScene;
    surface: Surface;
    uniforms: IUniformInternal[];
    readonly uid: number;
    private _uid;
    vertexAttributes: IVertexAttributeInternal[];
    view: View<IViewProps>;
    willRebuildLayer: boolean;
    constructor(surface: Surface, scene: LayerScene, props: ILayerProps<T>);
    init(): boolean;
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
    getMaterialOptions(): ILayerMaterialOptions;
    initShader(): IShaderInitialization<T> | null;
    managesInstance(instance: T): boolean;
    getLayerBufferType<T extends Instance>(_gl: WebGLRenderingContext, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): LayerBufferType;
    makeLayerBufferManager(gl: WebGLRenderingContext, scene: LayerScene): void;
    rebuildLayer(): void;
    resolveChanges(preserveProvider?: boolean): [T, import("../types").InstanceDiffType, {
        [key: number]: number;
    }][];
    setBufferManager(bufferManager: BufferManagerBase<T, IBufferLocation>): void;
    setBufferType(val: LayerBufferType): void;
    shouldDrawView(oldProps: U, newProps: U): boolean;
    updateUniforms(): void;
    willUpdateProps(newProps: ILayerProps<T>): void;
}
