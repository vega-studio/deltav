import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "./event-management/index.js";
import { Attribute, GLSettings, IMaterialUniform, MaterialOptions, MaterialUniformType, Texture } from "./gl/index.js";
import type { IndexBuffer } from "./gl/index-buffer.js";
import { Instance } from "./instance-provider/instance.js";
import { IAutoEasingMethod } from "./math/auto-easing-method.js";
import { BaseProjection } from "./math/index.js";
import { Mat3x3, Mat4x4, Vec, Vec1, Vec2, Vec2Compat, Vec3, Vec4 } from "./math/index.js";
import { BaseResourceOptions } from "./resources/base-resource-manager.js";
import { ISceneOptions } from "./surface/layer-scene.js";
import { IViewProps, View } from "./surface/view.js";
export type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ShaderIOValue = Vec1 | Vec2 | Vec3 | Vec4 | Vec4[] | Float32Array;
export type InstanceIOValue = Vec1 | Vec2 | Vec3 | Vec4 | Mat4x4;
export type InstanceIOVectorValue = Vec1 | Vec2 | Vec3 | Vec4;
export type UniformIOValue = number | InstanceIOValue | Mat3x3 | Mat4x4 | Float32Array | Texture | number[];
export declare enum InstanceBlockIndex {
    INVALID = 0,
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
    MAT4X4 = 16,
    /** Special case for making instance attributes that can target Atlas resources */
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
    FLOAT_ARRAY = 97,
    VEC4_ARRAY = 98,
    TEXTURE = 99
}
export type UniformBufferSize = UniformSize.ONE | UniformSize.TWO | UniformSize.THREE | UniformSize.FOUR | UniformSize.MATRIX3 | UniformSize.MATRIX4;
export declare enum VertexAttributeSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4
}
export declare enum IndexBufferSize {
    /** Supports 256 vertices */
    UINT8 = 1,
    /** Supports 65536 vertices */
    UINT16 = 2,
    /** Supports 4294967296 vertices */
    UINT32 = 3
}
/**
 * These are valid texture sizes available. We force a power of 2 to be utilized.
 * We do not allow crazy large sizes as browsers have very real caps on
 * resources. This helps implementations be a little smarter about what they are
 * using. Future versions may increase this number as GPUs improve and standards
 * allow greater flexibility.
 */
export declare enum TextureSize {
    /**
     * Specialized sizing that makes the texture stick with a 256th the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_256TH = -256,
    /**
     * Specialized sizing that makes the texture stick with a 128th the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_128TH = -128,
    /**
     * Specialized sizing that makes the texture stick with a 64th the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_64TH = -64,
    /**
     * Specialized sizing that makes the texture stick with a 32nd the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_32ND = -32,
    /**
     * Specialized sizing that makes the texture stick with a sixteenth the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_16TH = -16,
    /**
     * Specialized sizing that makes the texture stick with an eigth the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_8TH = -8,
    /**
     * Specialized sizing that makes the texture stick with a quarter the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_QUARTER = -4,
    /**
     * Specialized sizing that makes the texture stick with half the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN_HALF = -2,
    /**
     * Specialized sizing that makes the texture stick with the size of the
     * canvas/screen being rendered to. This sizing is only valid for managers
     * that properly watch the screen such as the render texture resource manager.
     */
    SCREEN = -1,
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
/**
 * Types of reesources that can be generated and provided via the resource
 * manager
 */
export declare enum ResourceType {
    ATLAS = 0,
    FONT = 1,
    TEXTURE = 2,
    COLOR_BUFFER = 3
}
/**
 * Base options needed for a resource to be considered a viable resource
 */
export interface IResourceType {
    type: number;
}
/**
 * This represents a color in the VoidGL system. Ranges are
 * [0 - 1, 0 - 1, 0 - 1, 0 - 1]
 */
export type Color = Vec4;
/**
 * Readonly:
 * This represents a color in the VoidGL system. Ranges are
 */
export type ReadonlyColor = Readonly<Vec4>;
/**
 * This represents a rotation in Euler angles [X axis, Y axis, Z axis]
 */
export type EulerRotation = Vec3;
/**
 * Readonly:
 * This represents a rotation in Euler angles [X axis, Y axis, Z axis]
 */
export type ReadonlyEulerRotation = Readonly<Vec3>;
/**
 * Order description of the way a euler angle is supposed to be applied
 */
export declare enum EulerOrder {
    zyx = 0,
    zyz = 1,
    zxy = 2,
    zxz = 3,
    yxz = 4,
    yxy = 5,
    yzx = 6,
    yzy = 7,
    xyz = 8,
    xyx = 9,
    xzy = 10,
    xzx = 11
}
/**
 * Represents something with a unique id
 */
export interface IdentifiableById {
    /** A unique identifier */
    id: string | number;
}
/**
 * Represents something with a unique key
 */
export interface IdentifiableByKey {
    /** A unique identifier */
    key: string | number;
}
/**
 * Information provided in user interaction events interacting with instances
 * and layers.
 */
export interface IPickInfo<T extends Instance> {
    /** The interaction that created this picking information */
    readonly interaction?: IMouseInteraction | ITouchInteraction;
    /** This is the parent layer id of the instances interacted with */
    readonly layer: string;
    /** This is the list of instances that were detected in the interaction */
    readonly instances: T[];
    /**
     * This is the screen coordinates of the interaction point that interacted
     * with the instances
     */
    readonly screen: Vec2;
    /**
     * This is the world coordinates of the ineraction point that interacted with
     * the instances
     */
    readonly world: Vec2Compat;
    /** Projection methods to easily go between coordinate spaces */
    readonly projection: BaseProjection<any>;
}
/**
 * Picking info associated with mouse events
 */
export interface IMousePickInfo<T extends Instance> extends IPickInfo<T> {
    /** The mouse interaction that created this picking information */
    readonly interaction: IMouseInteraction;
}
/**
 * Picking info associated with touch events
 */
export interface ITouchPickInfo<T extends Instance> extends IPickInfo<T> {
    /**
     * The touch interaction that created this picking information. Contains all
     * touch interactive information for the event
     */
    readonly interaction: ITouchInteraction;
    /** The specific touch that caused the event to occur */
    readonly touch: ISingleTouchInteraction;
}
export interface IVertexAttribute {
    /**
     * When initWithBuffer and customFill are not specified, this is was the
     * system will initially load each vertex attribute with.
     */
    defaults?: number[];
    /**
     * When this is specified it will initialize the model's attribute with the
     * data in this buffer.
     */
    initWithBuffer?: Float32Array;
    /**
     * When generating this attribute in the shader this will be the prefix to the
     * attribute: For instance, if you specify 'highp' as the modifier, then the
     * attribute that appears in the shader will be: attribute highp vec3
     * position;
     */
    qualifier?: string;
    /**
     * This is the name the attribute will be for the model.
     */
    name: string;
    /**
     * This is the number of floats the attribute will consume. For now, we only
     * allow for up to four floats per attribute.
     */
    size: VertexAttributeSize;
    /**
     * This lets you populate the buffer with an automatically called method. This
     * will fire when necessary updates are detected or on initialization.
     */
    update(vertex: number): ShaderIOValue;
}
export interface IIndexBuffer {
    /**
     * This specifies the byte size of the index buffer indices. Each size can
     * support a limited number of vertices:
     *
     * UINT8: 256 vertices
     * UINT16: 65536 vertices
     * UINT32: 4294967296 vertices
     *
     * This will be the INITIAL size of the buffer. However, this engine does a
     * LOT to seamlessly support instancing no matter the strategy in use. So
     * behind the scenes, this buffer can be cast up to use a higher precision if
     * required to support additional instances.
     */
    size: IndexBufferSize;
    /**
     * We define the number of vertices for the vertex data with vertexCount, but
     * here we specify how many vertices this index buffer contains to reference
     * those vertices.
     */
    indexCount: number;
    /**
     * This lets you populate the buffer with an automatically called method. This
     * will fire on initialization and will expect all of the values needed to
     * fully make your meshes index buffer.
     *
     * We use this strategy of calling a method per value to allow for a streamed
     * approach to filling the buffer. This will help with preventing accidental
     * mutations, and will offer an opportunity to prevent full duplicates of the
     * entire model's vertex buffers from being loaded in at a single time.
     */
    update(index: number): number;
}
export interface IVertexAttributeInternal extends IVertexAttribute {
    /**
     * This is the actual attribute generated internally for the GL interfacing
     */
    materialAttribute: Attribute | null;
}
export interface IIndexBufferInternal extends IIndexBuffer {
    /**
     * This is the actual buffer generated internally for the GL interfacing
     */
    materialIndexBuffer: IndexBuffer | null;
}
export interface IInstanceAttribute<TInstance extends Instance> {
    /**
     * If this is specified, this attribute becomes a size of 4 and will have a
     * block index of 0. This makes this attribute and layer become compatible
     * with reading atlas resources. The value provided for this property should
     * be the name of the atlas that is created.
     */
    resource?: {
        /**
         * This is a method that should return the string key identifier of the
         * resource to be used
         */
        key(): string;
        /**
         * Specify the name that will be injected that will be the sampler2D in the
         * shader
         */
        name: string;
        /**
         * This specifies which of the shaders the sampler2D will be injected into.
         * Defaults to the Fragment shader only.
         */
        shaderInjection?: ShaderInjectionTarget;
    };
    /**
     * This is a block index helping describe the instancing process. It can be
     * any number as the system will sort and organize them for you. This only
     * helps the system detect when you cram too much info into a single block.
     * The tighter you pack your blocks the better your program will perform.
     *
     * Note: It's best to leave this blank as the system now packs your attributes
     * for you and will determine this number for you.
     */
    block?: number;
    /**
     * This is the index within the block this attribute will be available.
     */
    blockIndex?: InstanceBlockIndex;
    /**
     * Child attributes are attributes that are guaranteed to update when the
     * parent attribute is updated. This is useful for attributes with special
     * properties that get expanded to other types of attributes such as easing
     * attributes which gain start, duration, and other values to make the
     * attribute work.
     *
     * If the settings on this attrubute spawns additional attributes, those
     * attributes shall be populated here. Otherwise this remains undefined.
     */
    childAttributes?: IInstanceAttribute<TInstance>[];
    /**
     * When this is set, the system will automatically inject necessary Shader IO
     * to facilitate performing the easing on the GPU, which saves enormous
     * amounts of CPU processing time trying to calcuate animations and tweens for
     * properties.
     *
     * NOTE: Setting this increases the amount of data per instance by: size * 2 +
     * ; as it injects in a start value, start time, and duration
     */
    easing?: IAutoEasingMethod<Vec>;
    /**
     * This is the name that will be available in your shader for use. This will
     * only be available after the ${attributes} declaration.
     */
    name: string;
    /**
     * If this attribute is created automatically by the system based on the
     * settings of another attribute, that parent attribute will be set here.
     * Otherwise this remains undefined.
     */
    parentAttribute?: IInstanceAttribute<TInstance>;
    /**
     * When generating this attribute in the shader this will be the prefix to the
     * attribute: For instance, if you specify 'highp' as the modifier, then the
     * attribute that appears in the shader will be: attribute highp vec3
     * position;
     */
    qualifier?: string;
    /**
     * This is how many floats the instance attribute takes up. Due to how
     * instancing is implemented, we can only take up to 4 floats per variable
     * right now.
     */
    size?: InstanceAttributeSize;
    /**
     * This is the accessor that executes when the instance needs updating. Simply
     * return the value that should be populated for this attribute.
     */
    update(instance: TInstance): InstanceIOValue;
}
/**
 * Internal Instance Attributes are ones that actually map to an attribute in
 * the shader and use hardware instancing.
 */
export interface IInstanceAttributeInternal<T extends Instance> extends IInstanceAttribute<T> {
    /** We will keep an internal uid for the  */
    uid: number;
    /**
     * Sometimes an attribute is actually a sub attribute to another attribute,
     * such as in the cases of attribute packing (in uniforms or in attribute
     * packing). This UID indicates the parental attribute UID. This parent
     * identifier may be an actual InstanceAttribute or not. It could just
     * indicate this attribute is packed into SOMETHING.
     */
    packUID?: number;
    /** This is the actual attribute mapped to a buffer */
    bufferAttribute: Attribute;
}
/**
 * This is specifically a deduced type of instance attribute that is specially
 * dealing with Vec1-4 values. These types of vectors can be dealt with in
 * special ways, thus they get this special case.
 */
export interface IInstanceAttributeVector<T extends Instance> extends IInstanceAttribute<T> {
    update(instance: T): InstanceIOVectorValue;
}
/**
 * Typeguard to determine if an instance attribute provides vectors or something
 * larger
 */
export declare function isInstanceAttributeVector<T extends Instance>(val: IInstanceAttribute<T>): val is IInstanceAttributeVector<T>;
/**
 * This is an attribute where the resource is definitely declared.
 */
export interface IResourceInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    /**
     * If this is specified, this attribute becomes a size of 4 and will have a
     * block index of 0. This makes this attribute and layer become compatible
     * with reading resources. The value provided for this property should be the
     * name of the resource that is created.
     */
    resource: {
        /**
         * This retrieves the key of the resource that is to be used by the
         * attribute
         */
        key(): string;
        /**
         * Specify the name that will be injected that will be the sampler2D in the
         * shader
         */
        name: string;
        /**
         * This specifies which of the shaders the sampler2D will be injected into.
         * Defaults to the Fragment shader only.
         */
        shaderInjection?: ShaderInjectionTarget;
    };
}
/**
 * This represents the minimum information to target a specific resource.
 */
export interface IResourceContext {
    /** Indicates a resource is specified */
    resource: {
        /**
         * The resource type. This is the type a manager is registered with when
         * setting up a surface.
         */
        type: number;
        /** This is the identifier of the specific resource within the manager */
        key: string;
    };
}
/**
 * Type guard for resource instance attributes
 */
export declare function isResourceAttribute<T extends Instance>(val: IInstanceAttribute<T>): val is IResourceInstanceAttribute<T>;
/**
 * This is an attribute that is simply a value
 */
export interface IEasingInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    /**
     * This MUST be defined to be an Easing attribute
     */
    easing: IAutoEasingMethod<Vec> & {
        uid?: number;
    };
    /**
     * Easing attributes requires size to be present
     */
    size: InstanceAttributeSize;
    /**
     * If this is an easing attribute, then the instance will only provide Vec1-4
     * values
     */
    update(o: T): InstanceIOVectorValue;
}
/**
 * This is an attribute that is simply a value
 */
export interface IValueInstanceAttribute<T extends Instance> extends IInstanceAttribute<T> {
    /**
     * If this is specified, this attribute becomes a size of 4 and will have a
     * block index of
     * 0. This makes this attribute and layer become compatible with reading atlas
     *    resources. The value provided for this property should be the name of
     *    the atlas that is created.
     */
    atlas: undefined;
}
/**
 * These are flags for indicating which shaders receive certain injection
 * elements
 */
export declare enum ShaderInjectionTarget {
    /** ONLY the vertex shader will receive the injection */
    VERTEX = 1,
    /** ONLY the fragment shader will receive the injection */
    FRAGMENT = 2,
    /** Both the fragment and vertex shader will receive the injection */
    ALL = 3
}
export interface IUniform {
    /**
     * This lets you specify which of the shaders will receive this uniform as
     * available. This defaults to only injecting into the vertex shader.
     */
    shaderInjection?: ShaderInjectionTarget;
    /** Name of the uniform as will be available in the shaders */
    name: string;
    /** How many floats the uniform shall encompass */
    size: UniformSize;
    /**
     * When generating this uniform in the shader this will be the prefix to the
     * uniform: For instance, if you specify 'highp' as the modifier, then the
     * uniform that appears in the shader will be: uniform highp vec3 position;
     */
    qualifier?: string;
    /**
     * This is the accessor that executes every frame before this layer is drawn.
     * It gives opportunity to update the uniform's value before every draw.
     */
    update(uniform: IUniform): UniformIOValue;
}
export interface IUniformInternal extends IUniform {
    /**
     * All layers will have many many ShaderMaterials generated per each instance
     * buffer as a single buffer can only render so many instances. This tracks
     * across all generated ShaderMaterials for each buffer the material uniforms
     * that need to be updated as a Uniform for a layer is dictated as uniform
     * across all instances.
     */
    materialUniforms: IMaterialUniform<MaterialUniformType>[];
}
/**
 * This is the structure of a uniform generated for the sake of instancing
 */
export interface IInstancingUniform {
    name: string;
    type: MaterialUniformType.FLOAT | MaterialUniformType.VEC2 | MaterialUniformType.VEC3 | MaterialUniformType.VEC4 | MaterialUniformType.VEC4_ARRAY;
    value: ShaderIOValue;
}
/**
 * This represents a target resource that expects a given information type.
 * OutputFragmentShaderSource's can be associated to these target types via
 * matching on the outputType.
 *
 * While outputType is mostly arbitrary to the implementation, the outputType of
 * "0" is defaulted to the concept of COLOR. COLOR is a default type of output
 * that is used extensively in the system to default an output to a target in
 * simplified cases.
 *
 * A target of type "string" will have an inferred default outputType of COLOR
 * or "0".
 */
export type OutputFragmentShaderTarget = BaseResourceOptions | {
    /**
     * The form of information this output will provide. This is mostly an
     * arbitrary number to help make associations between an output target and the
     * type of information a layer can provide.
     */
    outputType: number;
    /** The resource key that the output will target */
    resource: BaseResourceOptions;
}[];
/**
 * This represents a fragment shader that has been processed to include all of
 * it's potential outputs.
 *
 * While outputType is mostly arbitrary to the implementation, the outputType of
 * "0" is defaulted to the concept of COLOR. COLOR is a default type of output
 * that is used extensively in the system to default an output to a target in
 * simplified cases which includes the SCREEN.
 */
export type OutputFragmentShader = Map<View<IViewProps>, {
    source: string;
    outputTypes: number[];
    outputNames: string[];
}>;
/** Provides the value type of a Map */
export type MapValueType<A> = A extends Map<any, infer V> ? V : never;
/**
 * Defines a fragment shader source declaration that indicates fragment shader
 * renderings that can output for various information types.
 *
 * While outputType is mostly arbitrary to the implementation, the outputType of
 * "0" is defaulted to the concept of COLOR. COLOR is a default type of output
 * that is used extensively in the system to default an output to a target in
 * simplified cases.
 *
 * An output of type "string" will have an inferred default outputType of COLOR
 * or "0".
 */
export type OutputFragmentShaderSource = string | {
    source: string;
    outputType: number;
}[];
/**
 * Represents a complete shader object set with raw source information. The
 * fragment shaders here can provide hints to what output targets they are
 * compatible with.
 */
export interface IShadersSource {
    /**
     * This provides the fragment rendering outputs this layer will perform. If
     * specify a single output source this will assume you are providing a COLOR
     * output type.
     *
     * If multiple sources are included, this will map each output type to an
     * available matching output. If a matching output is not available, this will
     * render the marked COLOR output. If no COLOR output is available, then this
     * will assume the full processing of all outputs will be utilized and the
     * FINAL output in the list will output as the COLOR regardless of what it is
     * flagged as.
     *
     * IMPORTANT: Each source is a dependent of the sources before it. So if you
     * have operations in the main() method of a preceding action, ALL values
     * declared in that source is available in the next source. So, it is an error
     * to declare any same properties in the next source. The program outside of
     * the main() of each output is aggregated together, so if you have external
     * methods, you only need to declare the methods in the top most shader.
     *
     * Each source can have it's own set of imports as imports get resolved all at
     * once anyways.
     *
     * Be mindful how you set up your sources. If you do this wisely, you can have
     * this layer have a higher or smaller performance footprint based on how the
     * layer is being used. A well written layer for your application can adapt to
     * several scenarios AND provide maximum performance.
     */
    fs: OutputFragmentShaderSource;
    /** This is the shader source for your vertex shader. */
    vs: string;
}
/**
 * Represents a complete shader object set with analyzed fragment shaders that
 * are compatible with target outputs.
 */
export interface IShaders {
    /**
     * This provides the fragment rendering outputs this layer will perform. If
     * specify a single output source this will assume you are providing a COLOR
     * output type.
     *
     * If multiple sources are included, this will map each output type to an
     * available matching output. If a matching output is not available, this will
     * render the marked COLOR output. If no COLOR output is available, then this
     * will assume the full processing of all outputs will be utilized and the
     * FINAL output in the list will output as the COLOR regardless of what it is
     * flagged as.
     *
     * IMPORTANT: Each source is a dependent of the sources before it. So if you
     * have operations in the main() method of a preceding action, ALL values
     * declared in that source is available in the next source. So, it is an error
     * to declare any same properties in the next source. The program outside of
     * the main() of each output is aggregated together, so if you have external
     * methods, you only need to declare the methods in the top most shader.
     *
     * Each source can have it's own set of imports as imports get resolved all at
     * once anyways.
     *
     * Be mindful how you set up your sources. If you do this wisely, you can have
     * this layer have a higher or smaller performance footprint based on how the
     * layer is being used. A well written layer for your application can adapt to
     * several scenarios AND provide maximum performance.
     */
    fs: OutputFragmentShader;
    /** This is the shader source for your vertex shader. */
    vs: string;
}
/**
 * Represents an element that has a full list of projection methods
 */
export interface IProjection {
    /**
     * Since projections are the views (just interface stripping functionality) we
     * should provide the id for added flexibility to events
     */
    id: string;
    /** This is the chart camera utilized in the projection of elements */
    props: IViewProps;
    /** Converts from the pixel density layer to the screen space */
    pixelSpaceToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from the screen coordinates to the pixel density layer */
    screenToPixelSpace(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from screen space to the view's relative coordinates */
    screenToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from screen space to the world space of a scene */
    screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from a view's space to the screen */
    viewToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from a views space to the world coordinates */
    viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from world coordinate space of a scene to the screen */
    worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /** Converts from world coordinate space of a scene to the view's space */
    worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}
/**
 * The empty, do-nothing, method we devs find ourselves using too much.
 */
export declare function NOOP(): void;
/**
 * White space character test
 */
export declare const whiteSpaceRegEx: RegExp;
export declare const whiteSpaceCharRegEx: RegExp;
export declare const isWhiteSpace: (string: string) => boolean;
/**
 * Newline character test
 */
export declare const newLineRegEx: RegExp;
export declare const newLineCharRegEx: RegExp;
export declare const isNewline: (string: string) => boolean;
/**
 * Options a layer can provide for a material
 */
export type ILayerMaterialOptions = Partial<Omit<MaterialOptions, "uniforms" | "vertexShader" | "fragmentShader">>;
/**
 * A wrapper to make declaring layer material options easier and clearer
 */
export declare function createMaterialOptions(options: ILayerMaterialOptions, extend?: ILayerMaterialOptions): Partial<Omit<MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">>;
/**
 * This is the type of picking assigned to a layer. Each mode has performance
 * and functionality tradeoffs.
 */
export declare enum PickType {
    /** Disable any picking methodology */
    NONE = 0,
    /**
     * Uses highly useable color rendering method to detect an instance on a
     * pixel by pixel check. Since it is based on rendering, it will only select
     * the 'visually' top most rendered instance. This means instances can be
     * occluded by other instances if an instance renders behind another.
     */
    SINGLE = 1
}
/**
 * This represents the settings and objects used to facilitate picking in a
 * layer.
 */
export interface IPickingMetrics {
    /**
     * This is the current pick mode that is active during the draw pass of the
     * layer
     */
    currentPickMode: PickType;
    /** This is the picking style to be used */
    type: PickType;
}
/**
 * This is the picking settings and objects to facilitate PickType.SINGLE so we
 * can get a single instance underneath the mouse.
 */
export interface ISinglePickingMetrics<T extends Instance> extends IPickingMetrics {
    /** Set the enum for the type */
    type: PickType.SINGLE;
    /**
     * This is a lookup of the instance by it's UID which is all that is needed to
     * decode a color to an instance The color UINT8 components composited into a
     * single UINT32 IS the UID of the instance
     */
    uidToInstance: Map<number, T>;
}
/**
 * This is the picking settings and objects to facilitate PickType.NONE where no
 * information is retrieved for mouse interactions.
 */
export interface INonePickingMetrics extends IPickingMetrics {
    type: PickType.NONE;
}
export interface IColorPickingData {
    /** The view this color picking information is associated with */
    view: View<IViewProps>;
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
    /** The nearest found color in byte form */
    nearestColorBytes: Vec4;
    /** All colors in the data */
    allColors: number[];
}
/**
 * Diff types that an instance can go through. Used to help the system consume
 * the diff and apply it to the GL framework.
 */
export declare enum InstanceDiffType {
    CHANGE = 0,
    INSERT = 1,
    REMOVE = 2
}
/**
 * This is the metrics associated with a frame. Mostly dealing with timing
 * values.
 */
export type FrameMetrics = {
    /** The frame number rendered. Increases by 1 every surface draw */
    currentFrame: number;
    /** The start time of the current frame */
    currentTime: number;
    /** This is the duration of the previous frame */
    frameDuration: number;
    /** The start time of the previous frame */
    previousTime: number;
};
/**
 * This represents controls that can be utilized when adjustig easing
 */
export interface IEasingControl {
    /**
     * A value in ms that expresses how long the system should wait before
     * beginning the animation
     */
    readonly delay?: number;
    /** Indicates how long the easing should take to complete in ms */
    readonly duration: number;
    /** The end value the easing should approach */
    readonly end: Vec;
    /** The starting value of the easing object */
    readonly start: Vec;
    /** The start time in ms the easing object utilizes */
    readonly startTime: number;
    /**
     * If you manually set values for the easing properties, then you use this to
     * return the easing object back to an automated state which is where the
     * start value is the calculated current position of the output and the delay
     * and duration is determined by the easing set to the layer's
     * IAutomatedEasingMethod value set to the layer.
     */
    setAutomatic(): void;
    /**
     * This controls the start value of the easing. This should be used to force a
     * starting value of the animation.
     *
     * Use setAutomatic() to return to default easing behavior.
     */
    setStart(start?: Vec): void;
    /**
     * This controls of the timing of the easing equation. This should be used to
     * adjust when a value is to be adjusted
     *
     * Use setAutomatic() to return to default easing behavior.
     */
    setTiming(delay?: number, duration?: number): void;
}
/**
 * This is the minimum properties required to make all easing functions operate.
 */
export interface IEasingProps {
    /**
     * A value in ms that expresses how long the system should wait before
     * beginning the animation
     */
    delay?: number;
    /** Indicates how long the easing should take to complete in ms */
    duration: number;
    /** The end value the easing should approach */
    end: Vec;
    /**
     * A flag indicating if the easing start value is manually set, thus
     * prioritizing the values already set in this object
     */
    isManualStart?: boolean;
    /**
     * A flag indicating if the easing timing is manually set, thus prioritizing
     * the values already set in this object
     */
    isTimeSet?: boolean;
    /** The starting value of the easing object */
    start: Vec;
    /** The start time in ms the easing object utilizes */
    startTime: number;
}
export interface IShaderInputInstancing {
    /**
     * By default this is true, the buffers for the layer are instanced. This
     * minimizes memory useage AND dramatically improves performance on making
     * instance attribute updates.
     *
     * Conversly, disabling instanced buffers will improve rendering performance
     * for large amounts of data, but will struggle to stream instance property
     * updates in large amounts.
     *
     * It is recommended to always use instancing for large vertex count models.
     * As you approch small vertex counts, you can try non-instanced buffers to
     * see if there is a rendering benefit for some scenarios.
     */
    instancing?: boolean;
    /**
     * As instances are added to the layer, the backing buffers will grow with an
     * excess amount to allow more instances to be added before resizing takes
     * place (which is a decent performance hit).
     *
     * The default value for this is 1000. Which means after a resize happens,
     * there will be 1000 MORE unused instances in the buffer ready to be
     * activated. You will need to add 1000 more instances before the buffer will
     * trigger another resize.
     *
     * Setting this value to 0 ensures there are NO extra instances in the buffers
     * thus guaranteeing the smallest RAM footprint, but comes at the cost of
     * adding more instances likely to cause lag spikes. For sure use a value of 0
     * if there is going to most likely be a single instance in the buffer (some
     * very large model).
     */
    baseBufferGrowthRate?: number;
}
/**
 * This is the Shader IO information a layer will provide.
 */
export interface IShaderInputs<T extends Instance> {
    /**
     * Specifies how the vertices are laid out in the model. This defaults to
     * Triangle Strip if not specified
     */
    drawMode?: GLSettings.Model.DrawMode;
    /**
     * These are very frequently changing attributes and are uniform across all
     * vertices in the model
     */
    instanceAttributes?: (IInstanceAttribute<T> | null)[];
    /**
     * These are attributes that should be static on a vertex. These are
     * considered unique per vertex.
     */
    vertexAttributes?: (IVertexAttribute | null)[];
    /**
     * Buffer containing indices for index rendering.
     *
     * This will show an improvement in the amount of memory used for vertex
     * attribute data. This will show a large memory improvement the larger the
     * model and when instancing is disabled.
     */
    indexBuffer?: IIndexBuffer | null;
    /**
     * Specify how many vertices there are per instance. If vertex count is 0,
     * then the layer will render without instancing and draw the buffers
     * straight.
     */
    vertexCount: number;
    /**
     * These are uniforms in the shader. These are uniform across all vertices and
     * all instances for this layer.
     */
    uniforms?: (IUniform | null)[];
}
/**
 * This is the initialization of the shader.
 */
export type IShaderInitialization<T extends Instance> = IShaderInputInstancing & IShaderInputs<T> & IShadersSource;
export interface IShaderExtension {
    header?: string;
    main?: {
        pre?: string;
        post?: string;
    };
}
export type IShaderIOExtension<T extends Instance> = Partial<IShaderInputs<T>> & {
    vs?: IShaderExtension;
    fs?: IShaderExtension;
};
/**
 * A convenience for making short lists of items that are of the same type, such
 * as the common scenario of [boolean, boolean, boolean, boolean]
 */
export type TypeVec<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];
/**
 * Depicts a two or three dimensional size:
 * [width, height, depth]
 */
export type Size = Vec2 | Vec3;
/**
 * When creating a surface you must make it declare a pipeline. This makes a
 * centralized easy entry point for expressively declaring how the application
 * will utilize resources to render to various scenes and contexts.
 *
 * This is also used in a reactive diff manner so elements can be easily
 * updated/added/removed by providing all of the initializer elements. Thus to
 * add an item call the method including the element you wish to create. To
 * remove an element, simply exclude the element next time you call the method.
 */
export interface IPipeline {
    /**
     * These are the resources we want available that our layers can be provided
     * to utilize for their internal processes.
     */
    resources?: BaseResourceOptions[];
    /**
     * This sets up the available scenes the surface will have to work with.
     * Layers then can reference the scene by it's scene property. The order of
     * the scenes here is the drawing order of the scenes.
     */
    scenes?: ISceneOptions[];
}
/**
 * Errors emitted by the surface
 */
export declare enum SurfaceErrorType {
    /**
     * Error is thrown when no web gl context can be established for the canvas
     */
    NO_WEBGL_CONTEXT = 0
}
/**
 * Errors emitted by the surface
 */
export type SurfaceError = {
    error: SurfaceErrorType;
    message: string;
};
/**
 * A numerical or string identifier. Use this type to make your intent a little
 * clearer when you want a resource identified.
 */
export type SimpleId = string | number;
/**
 * An alias for a string. Use this type to make your intent a little clearer
 * when you want a string specifically for identifying a resource.
 */
export type StringId = string;
/**
 * An alias for a number. Use this type to make your intent a little clearer
 * when you want a number specifically for identifying a resource.
 */
export type NumberId = number;
/**
 * This is a massively useful type to express an object that can have numeric or
 * string identifiers in recursive amounts to define an object with many
 * pathways to various items of the same type (that can be varied by generic)
 *
 * ```
 * const o: Lookup<InstanceProvider<Instance>> = {
 *  circles: new InstanceProvider<CircleInstance>(),
 *  category: {
 *    special: new InstanceProvider<LabelInstance>(),
 *  }
 * }
 * ```
 */
export type Lookup<T> = {
    [key: string]: T | Lookup<T>;
};
/**
 * This expresses determined buffer types that already exists within the
 * framework.
 */
export declare enum LayerBufferType {
    /**
     * This is a compatibility mode for instance attributes. This is used when:
     * 1. It would perform better
     * 2. When instance attributes are not available for the gl context (ANGLE
     *    draw instanced arrays)
     * 3. When the instance attributes + vertex attributes exceeds the max Vertex
     *    Attributes for the hardware and Attribute packing still can not fit all
     *    of the attributes for the item.
     */
    UNIFORM = 1,
    /**
     * This is a fast and zippy buffering strategy used when the hardware supports
     * it for a provided layer! This makes instanced attributes which allows
     * single values per instance to be in the buffer instead of per vertex.
     */
    INSTANCE_ATTRIBUTE = 2,
    /**
     * This is a slight degradation from the normal INSTANCE_ATTRIBUTE buffering
     * strategy. If provided, attributes do not fit the limited amount of vertex
     * attributes supported by the hardware, then we have one last strategy to
     * utilize the highly optimized hardware instancing, which is to cram multiple
     * attributes within single attribute blocks. An attribute block is considered
     * to be 4 32 bit floats. These packed attributes will then get destructured
     * in the shader.
     */
    INSTANCE_ATTRIBUTE_PACKING = 3,
    /**
     * This is a buffering strategy when we don't want to use hardware instancing.
     * This will generate values PER VERTEX in the buffers instead of per
     * instance. This has the advantage of rendering statically much faster, but
     * increases RAM useage (for multiple instances) and increases the complexity
     * in making per instance updates that are not tied to uniforms for the
     * instance.
     */
    VERTEX_ATTRIBUTE = 4,
    /**
     * This is a buffering strategy when we don't want to use hardware instancing.
     * This will generate values PER VERTEX in the buffers instead of per
     * instance. This has the advantage of rendering statically much faster, but
     * increases RAM useage (for multiple instances) and increases the complexity
     * in making per instance updates that are not tied to uniforms for the
     * instance.
     *
     * This differs from VERTEXT_ATTRIBUTE in that it will pack multiple
     * attributes into a single attribute block and will be destructured in the
     * shader. If provided, attributes do not fit the limited amount of vertex
     * attributes supported by the hardware, then we have this strategy, which is
     * to cram multiple attributes within single attribute blocks. An attribute
     * block is considered to be 4 32 bit floats.
     */
    VERTEX_ATTRIBUTE_PACKING = 5
}
/**
 * This is an entry within the change list of the provider. It represents the
 * type of change and stores the property id's of the properties on the instance
 * that have changed.
 */
export type InstanceDiff<T extends Instance> = [
    T,
    InstanceDiffType,
    {
        [key: number]: number;
    }
];
/**
 * Bare minimum required features a provider must provide to be the data for the
 * layer.
 */
export interface IInstanceProvider<TInstance extends Instance> {
    /**
     * This indicates the context this provider was handled within. Currently,
     * only one context is allowed per provider, so we use this to detect when
     * multiple contexts have attempted use of this provider.
     */
    resolveContext: string;
    /** A unique number making it easier to identify this object */
    uid: number;
    /** A list of changes to instances */
    changeList: InstanceDiff<TInstance>[];
    /** Removes an instance from the list. Matches based on the object's uid */
    remove(instance: {
        uid: number;
    }): void;
    /** Resolves the changes as consumed */
    resolve(context: string): void;
    /**
     * Forces the provider to make a change list that ensures all elements are
     * added
     */
    sync(): void;
}
/**
 * This is the types of strategies available for streaming in changes to the
 * GPU.
 */
export declare enum StreamChangeStrategy {
    /** This takes the changes as they are discovered  */
    LINEAR = 0
}
/**
 * This is a reference to pass into a layer which will provide insight into the
 * layer's easing timing information so there can be better control and better
 * informed decisions on the rendering of elements that animate on the GPU.
 */
export interface ILayerEasingManager {
    /**
     * This is an async method that resolves when the current batch or stream has
     * completed it's easing animation in full.
     */
    complete(): Promise<void>;
}
/**
 * This is a reference object that is populated with controllers and relevant
 * exposed information regarding a layer.
 */
export interface ILayerRef {
    /**
     * The easing controller for the layer. This can be used to get precise
     * timings for completion of easing animations and other easing metrics.
     */
    easing: ILayerEasingManager | null;
}
/**
 * Type of transform prop that needs to track whether or not it has been
 * updated.
 */
export type UpdateProp<T> = {
    didUpdate?: boolean;
    value: T;
};
/**
 * Speedy check to see if a value is a string type or not
 */
export declare function isString(val?: any): val is string;
/**
 * Speedy check to see if a value is a number type or not
 */
export declare function isNumber(val?: any): val is number;
/**
 * Speedy check to see if the target object is a method or not. This avoids
 * string comparison with 'function'.
 */
export declare function isFunction<T extends Function>(val?: any): val is T;
/**
 * Checks if a value is strictly a boolean type. This avoids typeof and string
 * comparison.
 */
export declare function isBoolean(val?: any): val is boolean;
/**
 * This is a listing of suggested Output information styles.
 *
 * NOTE: Information styles are merely suggestions of information types. It does
 * NOT guarantee any specific type of data. These are merely flags to aid in
 * wiring available layer outputs to output render targets.
 *
 * You could theoretically use arbitrary numbers to match the two together, it
 * is recommended to utilize labeled enums though for readability.
 */
export declare enum FragmentOutputType {
    /**
     * Indicates this does not have an output target. This is mostly used by the
     * system to make sure our fragment outputs, drawBuffers, and frame buffer
     * attachments stay aligned properly to not cause any GL errors or undefined
     * outputs to occur.
     */
    NONE = 0,
    /**
     * This is generally specified when a layer has a fragment output that is a
     * no-op to allow for quickest rendering possible when performing operations
     * like rendering a shadow map.
     */
    BLANK = 1,
    /**
     * This is the most common information output style. It provides a color per
     * fragment
     */
    COLOR = 2,
    /**
     * This indicates it will provide a depth value per fragment
     */
    DEPTH = 3,
    /**
     * This indicates it will provide eye-space normal information per fragment
     */
    NORMAL = 4,
    /**
     * Indicates it will provide color information that coincides with instance
     * IDs used in the COLOR PICKING routines the system provides.
     */
    PICKING = 5,
    /**
     * This indicates it will provide eye-space position information per fragment.
     * Best used for a float texture when available.
     */
    POSITION = 6,
    /**
     * Sometimes compatibility is a major need. Thus this is used when float
     * textures are not available (which is often the case in Mobile). Instead of
     * getting to use a float point texture, one can use MRT and output each
     * positional component to separate textures.
     */
    POSITION_X = 7,
    /**
     * Sometimes compatibility is a major need. Thus this is used when float
     * textures are not available (which is often the case in Mobile). Instead of
     * getting to use a float point texture, one can use MRT and output each
     * positional component to separate textures.
     */
    POSITION_Y = 8,
    /**
     * Sometimes compatibility is a major need. Thus this is used when float
     * textures are not available (which is often the case in Mobile). Instead of
     * getting to use a float point texture, one can use MRT and output each
     * positional component to separate textures.
     */
    POSITION_Z = 9,
    /**
     * This indicates it will provide Lighting information
     */
    LIGHTS = 10,
    /**
     * This indicates it will provide Lighting information
     */
    LIGHTS2 = 11,
    /**
     * This indicates it will provide Lighting information
     */
    LIGHTS3 = 12,
    /**
     * This indicates it will provide Alpha information
     */
    ALPHA = 13,
    /**
     * This indicates it will provide Opacity information
     */
    OPAQUE = 14,
    /**
     * This indicates it will provide Beta information
     */
    BETA = 15,
    /**
     * This indicates it will provide Gamma information
     */
    GAMMA = 16,
    /**
     * This indicates it will provide Delta information
     */
    DELTA = 17,
    /**
     * This indicates it will provide some form of accumulation information
     */
    ACCUMULATION1 = 18,
    /**
     * This indicates it will provide some form of accumulation information
     */
    ACCUMULATION2 = 19,
    /**
     * This indicates it will provide some form of accumulation information
     */
    ACCUMULATION3 = 20,
    /**
     * This indicates it will provide some form of accumulation information
     */
    ACCUMULATION4 = 21,
    /**
     * This indicates it will provide Coefficient information
     */
    COEFFICIENT1 = 22,
    /**
     * This indicates it will provide Coefficient information
     */
    COEFFICIENT2 = 23,
    /**
     * This indicates it will provide Coefficient information
     */
    COEFFICIENT3 = 24,
    /**
     * This indicates it will provide Coefficient information
     */
    COEFFICIENT4 = 25,
    /**
     * This indicates it will provide Angular information
     */
    ANGLE1 = 26,
    /**
     * This indicates it will provide Angular information
     */
    ANGLE2 = 27,
    /**
     * This indicates it will provide Angular information
     */
    ANGLE3 = 28,
    /**
     * This indicates it will provide Angular information
     */
    ANGLE4 = 29,
    /**
     * This is the most common information output style. It provides an
     * alternative color per fragment
     */
    COLOR2 = 30,
    /**
     * This is the most common information output style. It provides an
     * alternative color per fragment
     */
    COLOR3 = 31,
    /**
     * This is the most common information output style. It provides an
     * alternative color per fragment
     */
    COLOR4 = 32,
    /**
     * This indicates this will output a fragment to a Glow filter target. Glow
     * targets are used post processing to indicate which texels in the post
     * operation should provide a bloom of a given color.
     */
    GLOW = 33,
    /**
     * This indicates this will output a fragment to a Glow filter target. Blur
     * targets are used post processing to indicate which texels in the post
     * operation should be blurred.
     */
    BLUR = 34,
    /**
     * This indicates this will output a fragment to a Moments filter target.
     * Moments are commonly used in shadow mapping techniques.
     */
    MOMENTS = 35
}
/**
 * Defines a type that can be partially filled
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
