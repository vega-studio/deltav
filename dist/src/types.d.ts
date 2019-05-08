import { Attribute, GLSettings, IMaterialUniform, MaterialOptions, MaterialUniformType, Texture } from "./gl";
import { Instance } from "./instance-provider/instance";
import { Bounds } from "./primitives/bounds";
import { ChartCamera, Mat3x3, Mat4x4, Vec, Vec1, Vec2, Vec3, Vec4 } from "./util";
import { IAutoEasingMethod } from "./util/auto-easing-method";
import { IVisitFunction, TrackedQuadTree } from "./util/tracked-quad-tree";
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type ShaderIOValue = Vec1 | Vec2 | Vec3 | Vec4 | Vec4[] | Float32Array;
export declare type InstanceIOValue = Vec1 | Vec2 | Vec3 | Vec4;
export declare type UniformIOValue = number | InstanceIOValue | Mat3x3 | Mat4x4 | Float32Array | Texture | number[];
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
    VEC4_ARRAY = 98,
    ATLAS = 99
}
export declare enum VertexAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4
}
export declare enum TextureSize {
    _2 = 2,
    _4 = 4,
    _8 = 8,
    _16 = 16,
    _32 = 32,
    _64 = 64,
    _128 = 128,
    _256 = 256,
    _512 = 512,
    _1024 = 1024,
    _2048 = 2048,
    _4096 = 4096
}
export declare enum ResourceType {
    ATLAS = 0,
    FONT = 1
}
export interface IResourceType {
    type: number;
}
export declare type Color = [number, number, number, number];
export interface Identifiable {
    id: string;
}
export interface IPickInfo<T extends Instance> {
    button?: number;
    layer: string;
    instances: T[];
    querySpace?(bounds: Bounds<T> | Vec2, visit?: IVisitFunction<T>): T[];
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
    materialAttribute: Attribute | null;
}
export interface IInstanceAttribute<T extends Instance> {
    resource?: {
        type: number;
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
    bufferAttribute: Attribute;
}
export interface IResourceInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    resource: {
        type: number;
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    };
}
export interface IResourceContext {
    resource: {
        type: number;
        key: string;
    };
}
export declare function isResourceAttribute<T extends Instance>(val: IInstanceAttribute<T>): val is IResourceInstanceAttribute<T>;
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
    materialUniforms: IMaterialUniform<MaterialUniformType>[];
}
export interface IInstancingUniform {
    name: string;
    type: MaterialUniformType.FLOAT | MaterialUniformType.VEC2 | MaterialUniformType.VEC3 | MaterialUniformType.VEC4 | MaterialUniformType.VEC4_ARRAY;
    value: ShaderIOValue;
}
export interface IShaders {
    fs: string;
    vs: string;
}
export interface IProjection {
    camera: ChartCamera;
    pixelSpaceToScreen(point: Vec2, out?: Vec2): Vec2;
    screenToPixelSpace(point: Vec2, out?: Vec2): Vec2;
    screenToView(point: Vec2, out?: Vec2): Vec2;
    screenToWorld(point: Vec2, out?: Vec2): Vec2;
    viewToScreen(point: Vec2, out?: Vec2): Vec2;
    viewToWorld(point: Vec2, out?: Vec2): Vec2;
    worldToScreen(point: Vec2, out?: Vec2): Vec2;
    worldToView(point: Vec2, out?: Vec2): Vec2;
}
export declare function NOOP(): void;
export declare const whiteSpaceRegEx: RegExp;
export declare const whiteSpaceCharRegEx: RegExp;
export declare const isWhiteSpace: any;
export declare const newLineRegEx: RegExp;
export declare const newLineCharRegEx: RegExp;
export declare const isNewline: any;
export declare type ILayerMaterialOptions = Partial<Omit<MaterialOptions, "uniforms" | "vertexShader" | "fragmentShader">>;
export declare function createMaterialOptions(options: ILayerMaterialOptions): Partial<Pick<Pick<Partial<import("./gl").Material>, "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "fragmentShader" | "name" | "polygonOffset" | "uniforms" | "vertexShader">, "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "name" | "polygonOffset">>;
export declare type InstanceHitTest<T> = (o: T, p: Vec2, v: IProjection) => boolean;
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
    nearestColorBytes: Vec4;
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
    frameDuration: number;
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
    drawMode?: GLSettings.Model.DrawMode;
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
export declare type TypeVec<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];
export declare type Size = Vec2 | Vec3;
