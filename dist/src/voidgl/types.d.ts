import * as Three from "three";
import { Bounds } from "./primitives/bounds";
import { IPoint } from "./primitives/point";
import { ChartCamera, Vec } from "./util";
import { IAutoEasingMethod } from "./util/auto-easing-method";
import { Instance } from "./util/instance";
import { IVisitFunction, TrackedQuadTree } from "./util/tracked-quad-tree";
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = {
    [P in Diff<keyof T, K>]: T[P];
};
export declare type ShaderIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number] | Three.Vector4[] | Float32Array;
export declare type InstanceIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number];
export declare type UniformIOValue = number | InstanceIOValue | Float32Array | Three.Texture;
export declare enum InstanceBlockIndex {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}
export declare enum InstanceAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    ATLAS = 99,
}
export declare enum UniformSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    MATRIX3 = 9,
    MATRIX4 = 16,
    ATLAS = 99,
}
export declare enum VertexAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
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
    block: number;
    blockIndex?: InstanceBlockIndex;
    easing?: IAutoEasingMethod<Vec>;
    name: string;
    qualifier?: string;
    atlas?: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    };
    size?: InstanceAttributeSize;
    update(instance: T): InstanceIOValue;
}
export interface IAtlasInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    atlas: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    };
}
export interface IEasingInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    easing: IAutoEasingMethod<Vec>;
    size: InstanceAttributeSize;
}
export interface IValueInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    atlas: undefined;
}
export declare type IInstanceAttributeInternal<T extends Instance> = IInstanceAttribute<T>;
export declare enum ShaderInjectionTarget {
    VERTEX = 1,
    FRAGMENT = 2,
    ALL = 3,
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
    header?: string;
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
    SINGLE = 2,
}
export interface IPickingMetrics {
    type: PickType;
}
export interface IQuadTreePickingMetrics<T extends Instance> extends IPickingMetrics {
    type: PickType.ALL;
    quadTree: TrackedQuadTree<T>;
    hitTest: InstanceHitTest<T>;
}
export interface ISinglePickingMetrics extends IPickingMetrics {
    type: PickType.SINGLE;
}
export declare type FrameMetrics = {
    currentFrame: number;
    currentTime: number;
    previousTime: number;
};
export interface IEasingProps {
    start: Vec;
    end: Vec;
    startTime: number;
    duration: number;
}
