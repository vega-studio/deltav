import * as Three from "three";
import { Instance } from "./instance-provider/instance";
import { Bounds } from "./primitives/bounds";
import { IPoint } from "./primitives/point";
import { ChartCamera, Vec, Vec2 } from "./util";
import { IAutoEasingMethod } from "./util/auto-easing-method";
import { IVisitFunction, TrackedQuadTree } from "./util/tracked-quad-tree";
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<TType, TKeys> = Pick<TType, Exclude<keyof TType, TKeys>>;
export declare type ShaderIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number] | Three.Vector4[] | Float32Array;
export declare type InstanceIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number];
export declare type UniformIOValue = number | InstanceIOValue | Float32Array | Three.Texture;
export declare enum InstanceBlockIndex {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4
}
export declare enum InstanceAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    ATLAS = 99
}
export declare const instanceAttributeSizeFloatCount: {
    [key: number]: number;
};
export declare enum UniformSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    MATRIX3 = 9,
    MATRIX4 = 16,
    ATLAS = 99
}
export declare enum VertexAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4
}
export declare type Color = [number, number, number, number];
export interface Identifiable {
    id: string;
}
export interface IPickInfo<T extends Instance> {
    button?: number;
    layer: string;
    instances: T[];
    querySpace?(bounds: Bounds | IPoint, visit?: IVisitFunction<T>): T[];
    screen: [number, number];
    world: [number, number];
    projection: IProjection;
}
export interface IVertexAttribute {
    defaults?: number[];
    initWithBuffer?: Float32Array;
    qualifier?: string;
    name: string;
    size: VertexAttributeSize;
    update(vertex: number): ShaderIOValue;
}
export interface IVertexAttributeInternal extends IVertexAttribute {
    materialAttribute: Three.BufferAttribute | null;
}
export interface IInstanceAttribute<T extends Instance> {
    atlas?: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    };
    block?: number;
    blockIndex?: InstanceBlockIndex;
    childAttributes?: IInstanceAttribute<T>[];
    easing?: IAutoEasingMethod<Vec>;
    name: string;
    parentAttribute?: IInstanceAttribute<T>;
    qualifier?: string;
    size?: InstanceAttributeSize;
    update(instance: T): InstanceIOValue;
}
export interface IInstanceAttributeInternal<T extends Instance> extends IInstanceAttribute<T> {
    uid: number;
    packUID?: number;
    bufferAttribute: Three.InstancedBufferAttribute;
}
export interface IAtlasInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    atlas: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    };
}
export interface IEasingInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    easing: IAutoEasingMethod<Vec> & {
        uid?: number;
    };
    size: InstanceAttributeSize;
}
export interface IValueInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    atlas: undefined;
}
export declare enum ShaderInjectionTarget {
    VERTEX = 1,
    FRAGMENT = 2,
    ALL = 3
}
export interface IUniform {
    shaderInjection?: ShaderInjectionTarget;
    name: string;
    size: UniformSize;
    qualifier?: string;
    update(uniform: IUniform): UniformIOValue;
}
export interface IUniformInternal extends IUniform {
    materialUniforms: Three.IUniform[];
}
export interface IInstancingUniform {
    name: string;
    type: "f" | "v2" | "v3" | "v4" | "4fv" | "bvec4";
    value: ShaderIOValue;
}
export interface IShaders {
    fs: string;
    vs: string;
}
export interface IProjection {
    camera: ChartCamera;
    pixelSpaceToScreen(point: IPoint, out?: IPoint): IPoint;
    screenToPixelSpace(point: IPoint, out?: IPoint): IPoint;
    screenToView(point: IPoint, out?: IPoint): IPoint;
    screenToWorld(point: IPoint, out?: IPoint): IPoint;
    viewToScreen(point: IPoint, out?: IPoint): IPoint;
    viewToWorld(point: IPoint, out?: IPoint): IPoint;
    worldToScreen(point: IPoint, out?: IPoint): IPoint;
    worldToView(point: IPoint, out?: IPoint): IPoint;
}
export declare type IMaterialOptions = Partial<Omit<Omit<Omit<Three.ShaderMaterialParameters, "uniforms">, "vertexShader">, "fragmentShader">>;
export declare type InstanceHitTest<T> = (o: T, p: IPoint, v: IProjection) => boolean;
export declare enum PickType {
    NONE = 0,
    ALL = 1,
    SINGLE = 2
}
export interface IPickingMetrics {
    currentPickMode: PickType;
    type: PickType;
}
export interface IQuadTreePickingMetrics<T extends Instance> extends IPickingMetrics {
    type: PickType.ALL;
    quadTree: TrackedQuadTree<T>;
    hitTest: InstanceHitTest<T>;
}
export interface ISinglePickingMetrics<T extends Instance> extends IPickingMetrics {
    type: PickType.SINGLE;
    uidToInstance: Map<number, T>;
}
export interface INonePickingMetrics extends IPickingMetrics {
    type: PickType.NONE;
}
export interface IColorPickingData {
    mouse: Vec2;
    colorData: Uint8Array;
    dataHeight: number;
    dataWidth: number;
    nearestColor: number;
    allColors: number[];
}
export declare enum InstanceDiffType {
    CHANGE = 0,
    INSERT = 1,
    REMOVE = 2
}
export declare type FrameMetrics = {
    currentFrame: number;
    currentTime: number;
    previousTime: number;
};
export interface IEasingControl {
    readonly delay?: number;
    readonly duration: number;
    readonly end: Vec;
    readonly start: Vec;
    readonly startTime: number;
    setAutomatic(): void;
    setStart(start?: Vec): void;
    setTiming(delay?: number, duration?: number): void;
}
export interface IEasingProps {
    delay?: number;
    duration: number;
    end: Vec;
    isManualStart?: boolean;
    isTimeSet?: boolean;
    start: Vec;
    startTime: number;
}
export interface IShaderInputs<T extends Instance> {
    instanceAttributes?: (IInstanceAttribute<T> | null)[];
    vertexAttributes?: (IVertexAttribute | null)[];
    vertexCount: number;
    uniforms?: (IUniform | null)[];
}
export declare type IShaderInitialization<T extends Instance> = IShaderInputs<T> & IShaders;
export interface IShaderExtension {
    header?: string;
    body?: string;
}
export declare type IShaderIOExtension<T extends Instance> = Partial<IShaderInputs<T>> & {
    vs?: IShaderExtension;
    fs?: IShaderExtension;
};
