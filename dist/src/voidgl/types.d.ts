import * as Three from 'three';
import { Bounds } from './primitives/bounds';
import { IPoint } from './primitives/point';
import { ChartCamera, Vec2 } from './util';
import { Instance } from './util/instance';
import { IVisitFunction, TrackedQuadTree } from './util/tracked-quad-tree';
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
    /** Special case for making instance attributes that can target Atlas resources */
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
/**
 * This represents a color in the VoidGL system. Ranges are [0 - 1, 0 - 1, 0 - 1, 0 - 1]
 */
export declare type Color = [number, number, number, number];
/**
 * Represents something with a unique id
 */
export interface Identifiable {
    /** A unique identifier */
    id: string;
}
/**
 * Information provided in mouse events interacting with instances and
 * layers.
 */
export interface IPickInfo<T extends Instance> {
    /** If a mouse button is involved in the pick, this will be populated */
    button?: number;
    /** This is the parent layer id of the instances interacted with */
    layer: string;
    /** This is the list of instances that were detected in the interaction */
    instances: T[];
    /** If picking is set to ALL then this will be provided which can be used to make additional spatial queries */
    querySpace?(bounds: Bounds | IPoint, visit?: IVisitFunction<T>): T[];
    /** This is the screen coordinates of the mouse point that interacted with the instances */
    screen: [number, number];
    /** This is the world coordinates of the mouse point that interacted with the instances */
    world: [number, number];
    /** Projection methods to easily go between coordinate spaces */
    projection: IProjection;
}
export interface IVertexAttribute {
    /**
     * When initWithBuffer and customFill are not specified, this is was the system will initially
     * load each vertex attribute with.
     */
    defaults?: number[];
    /**
     * When this is specified it will initialize the model's attribute with the data in this buffer.
     */
    initWithBuffer?: Float32Array;
    /**
     * When generating this attribute in the shader this will be the prefix to the attribute:
     * For instance, if you specify 'highp' as the modifier, then the attribute that appears
     * in the shader will be:
     * attribute highp vec3 position;
     */
    qualifier?: string;
    /**
     * This is the name the attribute will be for the model.
     */
    name: string;
    /**
     * This is the number of floats the attribute will consume. For now, we only allow for up
     * to four floats per attribute.
     */
    size: VertexAttributeSize;
    /**
     * This lets you populate the buffer with an automatically called method. This will fire when
     * necessary updates are detected or on initialization.
     */
    update(vertex: number): ShaderIOValue;
}
export interface IVertexAttributeInternal extends IVertexAttribute {
    /** This is the actual attribute generated internally for the ThreeJS interfacing */
    materialAttribute: Three.BufferAttribute;
}
export interface IInstanceAttribute<T extends Instance> {
    /**
     * This is a block index helping describe the instancing process. It can be any number as
     * the system will sort and organize them for you. This only helps the system detect when
     * you cram too much info into a single block. The tighter you pack your blocks the better
     * your program will perform.
     */
    block: number;
    /**
     * This is the index within the block this attribute will be available. This is automatically
     * populated by the system.
     */
    blockIndex?: InstanceBlockIndex;
    /**
     * This is the name that will be available in your shader for use. This will only be
     * available after the ${attributes} declaration.
     */
    name: string;
    /**
     * When generating this attribute in the shader this will be the prefix to the attribute:
     * For instance, if you specify 'highp' as the modifier, then the attribute that appears
     * in the shader will be:
     * attribute highp vec3 position;
     */
    qualifier?: string;
    /**
     * If this is specified, this attribute becomes a size of 4 and will have a block index of
     * 0. This makes this attribute and layer become compatible with reading atlas resources.
     * The value provided for this property should be the name of the atlas that is created.
     */
    atlas?: {
        /** Specify which generated atlas to target for the resource */
        key: string;
        /** Specify the name that will be injected that will be the sampler2D in the shader */
        name: string;
        /**
         * This specifies which of the shaders the sampler2D will be injected into.
         * Defaults to the Fragment shader only.
         */
        shaderInjection?: ShaderInjectionTarget;
    };
    /**
     * This is how many floats the instance attribute takes up. Due to how instancing is
     * implemented, we can only take up to 4 floats per variable right now.
     */
    size?: InstanceAttributeSize;
    /**
     * This is the accessor that executes when the instance needs updating. Simply return the
     * value that should be populated for this attribute.
     */
    update(instance: T): InstanceIOValue;
}
export declare type IInstanceAttributeInternal<T extends Instance> = IInstanceAttribute<T>;
/** These are flags for indicating which shaders receive certain injection elements */
export declare enum ShaderInjectionTarget {
    /** ONLY the vertex shader will receive the injection */
    VERTEX = 0,
    /** ONLY the fragment shader will receive the injection */
    FRAGMENT = 1,
    /** Both the fragment and vertex shader will receive the injection */
    ALL = 2,
}
export interface IUniform {
    /**
     * This lets you specify which of the shaders will receive this uniform as available.
     * This defaults to only injecting into the vertex shader.
     */
    shaderInjection?: ShaderInjectionTarget;
    /** Name of the uniform as will be available in the shaders */
    name: string;
    /** How many floats the uniform shall encompass */
    size: UniformSize;
    /**
     * When generating this uniform in the shader this will be the prefix to the uniform:
     * For instance, if you specify 'highp' as the modifier, then the uniform that appears
     * in the shader will be:
     * uniform highp vec3 position;
     */
    qualifier?: string;
    /**
     * This is the accessor that executes every frame before this layer is drawn. It gives
     * opportunity to update the uniform's value before every draw.
     */
    update(uniform: IUniform): UniformIOValue;
}
export interface IUniformInternal extends IUniform {
    /**
     * All layers will have many many ShaderMaterials generated per each instance buffer as a single buffer
     * can only render so many instances. This tracks across all generated ShaderMaterials for each buffer
     * the material uniforms that need to be updated as a Uniform for a layer is dictated as uniform across
     * all instances.
     */
    materialUniforms: Three.IUniform[];
}
/**
 * This is the structure of a uniform generated for the sake of instancing
 */
export interface IInstancingUniform {
    name: string;
    type: 'f' | 'v2' | 'v3' | 'v4' | '4fv' | 'bvec4';
    value: ShaderIOValue;
}
/**
 * Represents a complete shader object set.
 */
export interface IShaders {
    fs: string;
    header?: string;
    vs: string;
}
/**
 * Represents an element that has a full list of projection methods
 */
export interface IProjection {
    /** This is the chart camera utilized in the projection of elements */
    camera: ChartCamera;
    /** Converts from the pixel density layer to the screen space */
    pixelSpaceToScreen(point: IPoint, out?: IPoint): IPoint;
    /** Converts from the screen coordinates to the pixel density layer */
    screenToPixelSpace(point: IPoint, out?: IPoint): IPoint;
    /** Converts from screen space to the view's relative coordinates */
    screenToView(point: IPoint, out?: IPoint): IPoint;
    /** Converts from screen space to the world space of a scene */
    screenToWorld(point: IPoint, out?: IPoint): IPoint;
    /** Converts from a view's space to the screen */
    viewToScreen(point: IPoint, out?: IPoint): IPoint;
    /** Converts from a views space to the world coordinates */
    viewToWorld(point: IPoint, out?: IPoint): IPoint;
    /** Converts from world coordinate space of a scene to the screen */
    worldToScreen(point: IPoint, out?: IPoint): IPoint;
    /** Converts from world coordinate space of a scene to the view's space */
    worldToView(point: IPoint, out?: IPoint): IPoint;
}
export declare type IMaterialOptions = Partial<Omit<Omit<Omit<Three.ShaderMaterialParameters, 'uniforms'>, 'vertexShader'>, 'fragmentShader'>>;
/** This is the method signature for determining whether or not a point hits an instance */
export declare type InstanceHitTest<T> = (o: T, p: IPoint, v: IProjection) => boolean;
/**
 * This is the type of picking assigned to a layer. Each mode has performance and functionality
 * tradeoffs.
 */
export declare enum PickType {
    /** Disable any picking methodology */
    NONE = 0,
    /** Pick all instances found underneath the mouse. The Layer must explicitly support this feature. */
    ALL = 1,
    /**
     * NOTE: NOT IMPLEMENTED YET
     *
     * Uses highly efficient color rendering method to detect an instance on a pixel by pixel check. Since it is
     * based on rendering, it will only select the 'visually' top most rendered instance. This means instances can be occluded
     * by other instances is an instance renders behind another.
     *
     * This is vastly more efficient and accurate than ALL. This also will be more readily supported than ALL.
     */
    SINGLE = 2,
}
/**
 * This represents the settings and objects used to facilitate picking in a layer.
 */
export interface IPickingMetrics {
    /** This is the current pick mode that is active during the draw pass of the layer */
    currentPickMode: PickType;
    /** This is the picking style to be used */
    type: PickType;
}
/**
 * This is the picking settings and objects to facilitate PickType.ALL so we can get
 * all instances underneath the mouse.
 */
export interface IQuadTreePickingMetrics<T extends Instance> extends IPickingMetrics {
    /** This handles the ALL type only */
    type: PickType.ALL;
    /** This stores all of our instances in a quad tree to spatially track our instances */
    quadTree: TrackedQuadTree<T>;
    /** This is the method for performing a hit test with the provided instance */
    hitTest: InstanceHitTest<T>;
}
/**
 * This is the picking settings and objects to facilitate PickType.SINGLE so we can get
 * a single instance underneath the mouse.
 */
export interface ISinglePickingMetrics<T extends Instance> extends IPickingMetrics {
    /** Set the enum for the type */
    type: PickType.SINGLE;
    /**
     * This is a lookup of the instance by it's UID which is all that is needed to decode a color to an instance
     * The color UINT8 components composited into a single UINT32 IS the UID of the instance
     */
    uidToInstance: Map<number, T>;
}
/**
 * This is the picking settings and objects to facilitate PickType.NONE where no information
 * is retrieved for mouse interactions.
 */
export interface INonePickingMetrics extends IPickingMetrics {
    type: PickType.NONE;
}
export interface IColorPickingData {
    /** The mouse target position where the data is rendered */
    mouse: Vec2;
    /** The color data loaded for last picking rendering */
    colorData: Uint8Array;
    /** The height of the data array */
    dataHeight: number;
    /** The width of the data array */
    dataWidth: number;
    /** The nearest found color */
    nearestColor: number;
    /** All colors in the data */
    allColors: number[];
}
/**
 * Diff types that an instance can go through. Used to help the system consume the diff
 * and apply it to the GL framework.
 */
export declare enum InstanceDiffType {
    CHANGE = 0,
    INSERT = 1,
    REMOVE = 2,
}
