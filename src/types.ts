import {
  IMouseInteraction,
  ISingleTouchInteraction,
  ITouchInteraction
} from "src/event-management";
import {
  Attribute,
  GLSettings,
  IMaterialUniform,
  MaterialOptions,
  MaterialUniformType,
  Texture
} from "./gl";
import { Instance } from "./instance-provider/instance";
import { BaseProjection } from "./math";
import {
  Mat3x3,
  Mat4x4,
  Vec,
  Vec1,
  Vec2,
  Vec2Compat,
  Vec3,
  Vec4
} from "./math";
import { IAutoEasingMethod } from "./math/auto-easing-method";
import { BaseResourceOptions } from "./resources/base-resource-manager";
import { IViewProps } from "./surface";
import { ISceneOptions } from "./surface/layer-scene";

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ShaderIOValue = Vec1 | Vec2 | Vec3 | Vec4 | Vec4[] | Float32Array;
export type InstanceIOValue = Vec1 | Vec2 | Vec3 | Vec4 | Mat4x4;
export type InstanceIOVectorValue = Vec1 | Vec2 | Vec3 | Vec4;
export type UniformIOValue =
  | number
  | InstanceIOValue
  | Mat3x3
  | Mat4x4
  | Float32Array
  | Texture
  | number[];

export enum InstanceBlockIndex {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}

export enum InstanceAttributeSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  MAT4X4 = 16,
  /** Special case for making instance attributes that can target Atlas resources */
  ATLAS = 99
}

export const instanceAttributeSizeFloatCount: { [key: number]: number } = {
  [InstanceAttributeSize.ONE]: 1,
  [InstanceAttributeSize.TWO]: 2,
  [InstanceAttributeSize.THREE]: 3,
  [InstanceAttributeSize.FOUR]: 4,
  [InstanceAttributeSize.MAT4X4]: 16,
  [InstanceAttributeSize.ATLAS]: 4
};

export enum UniformSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  MATRIX3 = 9,
  MATRIX4 = 16,
  VEC4_ARRAY = 98,
  ATLAS = 99
}

export enum VertexAttributeSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}

/**
 * These are valid atlas sizes available. We force a power of 2 to be utilized.
 * We do not allow crazy large sizes as browsers have very real caps on resources.
 * This helps implementations be a little smarter about what they are using. Future
 * versions may increase this number as GPUs improve and standards allow greater
 * flexibility.
 */
export enum TextureSize {
  _2 = 0x01 << 1,
  _4 = 0x01 << 2,
  _8 = 0x01 << 3,
  _16 = 0x01 << 4,
  _32 = 0x01 << 5,
  _64 = 0x01 << 6,
  _128 = 0x01 << 7,
  _256 = 0x01 << 8,
  _512 = 0x01 << 9,
  _1024 = 0x01 << 10,
  _2048 = 0x01 << 11,
  _4096 = 0x01 << 12
}

/**
 * Types of reesources that can be generated and provided via the resource manager
 */
export enum ResourceType {
  ATLAS = 0,
  FONT = 1
}

/**
 * Base options needed for a resource to be considered a viable resource
 */
export interface IResourceType {
  type: number;
}

/**
 * This represents a color in the VoidGL system. Ranges are [0 - 1, 0 - 1, 0 - 1, 0 - 1]
 */
export type Color = Vec4;

/**
 * This represents a rotation in Euler angles [X axis, Y axis, Z axis]
 */
export type EulerRotation = Vec3;

/**
 * Order description of the way a euler angle is supposed to be applied
 */
export enum EulerOrder {
  zyx,
  zyz,
  zxy,
  zxz,
  yxz,
  yxy,
  yzx,
  yzy,
  xyz,
  xyx,
  xzy,
  xzx
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
 * Information provided in user interaction events interacting with instances and
 * layers.
 */
export interface IPickInfo<T extends Instance> {
  /** The interaction that created this picking information */
  readonly interaction?: IMouseInteraction | ITouchInteraction;
  /** This is the parent layer id of the instances interacted with */
  readonly layer: string;
  /** This is the list of instances that were detected in the interaction */
  readonly instances: T[];
  /** This is the screen coordinates of the interaction point that interacted with the instances */
  readonly screen: Vec2;
  /** This is the world coordinates of the ineraction point that interacted with the instances */
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
  /** The touch interaction that created this picking information. Contains all touch interactive information for the event */
  readonly interaction: ITouchInteraction;
  /** The specific touch that caused the event to occur */
  readonly touch: ISingleTouchInteraction;
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
  materialAttribute: Attribute | null;
}

export interface IInstanceAttribute<T extends Instance> {
  /**
   * If this is specified, this attribute becomes a size of 4 and will have a block index of
   * 0. This makes this attribute and layer become compatible with reading atlas resources.
   * The value provided for this property should be the name of the atlas that is created.
   */
  resource?: {
    /** This is a method that should return the string key identifier of the resource to be used */
    key(): string;
    /** Specify the name that will be injected that will be the sampler2D in the shader */
    name: string;
    /**
     * This specifies which of the shaders the sampler2D will be injected into.
     * Defaults to the Fragment shader only.
     */
    shaderInjection?: ShaderInjectionTarget;
  };
  /**
   * This is a block index helping describe the instancing process. It can be any number as
   * the system will sort and organize them for you. This only helps the system detect when
   * you cram too much info into a single block. The tighter you pack your blocks the better
   * your program will perform.
   *
   * Note: It's best to leave this blank as the system now packs your attributes for you and
   * will determine this number for you.
   */
  block?: number;
  /**
   * This is the index within the block this attribute will be available.
   */
  blockIndex?: InstanceBlockIndex;
  /**
   * Child attributes are attributes that are guaranteed to update when the parent attribute
   * is updated. This is useful for attributes with special properties that get expanded to
   * other types of attributes such as easing attributes which gain start, duration, and other values
   * to make the attribute work.
   *
   * If the settings on this attrubute spawns additional attributes, those attributes shall
   * be populated here. Otherwise this remains undefined.
   */
  childAttributes?: IInstanceAttribute<T>[];
  /**
   * When this is set, the system will automatically inject necessary Shader IO to facilitate
   * performing the easing on the GPU, which saves enormous amounts of CPU processing time
   * trying to calcuate animations and tweens for properties.
   *
   * NOTE: Setting this increases the amount of data per instance by: size * 2 + ;
   * as it injects in a start value, start time, and duration
   */
  easing?: IAutoEasingMethod<Vec>;
  /**
   * This is the name that will be available in your shader for use. This will only be
   * available after the ${attributes} declaration.
   */
  name: string;
  /**
   * If this attribute is created automatically by the system based on the settings of another
   * attribute, that parent attribute will be set here. Otherwise this remains undefined.
   */
  parentAttribute?: IInstanceAttribute<T>;
  /**
   * When generating this attribute in the shader this will be the prefix to the attribute:
   * For instance, if you specify 'highp' as the modifier, then the attribute that appears
   * in the shader will be:
   * attribute highp vec3 position;
   */
  qualifier?: string;
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

/**
 * Internal Instance Attributes are ones that actually map to an attribute in the shader and use
 * hardware instancing.
 */
export interface IInstanceAttributeInternal<T extends Instance>
  extends IInstanceAttribute<T> {
  /** We will keep an internal uid for the  */
  uid: number;
  /**
   * Sometimes an attribute is actually a sub attribute to another attribute, such as in the cases of
   * attribute packing (in uniforms or in attribute packing). This UID indicates the parental attribute
   * UID. This parent identifier may be an actual InstanceAttribute or not. It could just indicate this
   * attribute is packed into SOMETHING.
   */
  packUID?: number;
  /** This is the actual attribute mapped to a buffer */
  bufferAttribute: Attribute;
}

/**
 * This is specifically a deduced type of instance attribute that is specially dealing with Vec1-4 values. These types
 * of vectors can be dealt with in special ways, thus they get this special case.
 */
export interface IInstanceAttributeVector<T extends Instance>
  extends IInstanceAttribute<T> {
  update(instance: T): InstanceIOVectorValue;
}

/**
 * Typeguard to determine if an instance attribute provides vectors or something larger
 */
export function isInstanceAttributeVector<T extends Instance>(
  val: IInstanceAttribute<T>
): val is IInstanceAttributeVector<T> {
  return val.size !== undefined && val.size <= 4;
}

/**
 * This is an attribute where the resource is definitely declared.
 */
export interface IResourceInstanceAttribute<T extends Instance>
  extends IInstanceAttribute<T> {
  /**
   * If this is specified, this attribute becomes a size of 4 and will have a block index of
   * 0. This makes this attribute and layer become compatible with reading resources.
   * The value provided for this property should be the name of the resource that is created.
   */
  resource: {
    /** This retrieves the key of the resource that is to be used by the attribute */
    key(): string;
    /** Specify the name that will be injected that will be the sampler2D in the shader */
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
    /** The resource type. This is the type a manager is registered with when setting up a surface. */
    type: number;
    /** This is the identifier of the specific resource within the manager */
    key: string;
  };
}

/**
 * Type guard for resource instance attributes
 */
export function isResourceAttribute<T extends Instance>(
  val: IInstanceAttribute<T>
): val is IResourceInstanceAttribute<T> {
  return Boolean(val && val.resource);
}

/**
 * This is an attribute that is simply a value
 */
export interface IEasingInstanceAttribute<T extends Instance>
  extends IInstanceAttribute<T> {
  /**
   * This MUST be defined to be an Easing attribute
   */
  easing: IAutoEasingMethod<Vec> & { uid?: number };
  /**
   * Easing attributes requires size to be present
   */
  size: InstanceAttributeSize;
  /** If this is an easing attribute, then the instance will only provide Vec1-4 values */
  update(o: T): InstanceIOVectorValue;
}

/**
 * This is an attribute that is simply a value
 */
export interface IValueInstanceAttribute<T extends Instance>
  extends IInstanceAttribute<T> {
  /**
   * If this is specified, this attribute becomes a size of 4 and will have a block index of
   * 0. This makes this attribute and layer become compatible with reading atlas resources.
   * The value provided for this property should be the name of the atlas that is created.
   */
  atlas: undefined;
}

/** These are flags for indicating which shaders receive certain injection elements */
export enum ShaderInjectionTarget {
  /** ONLY the vertex shader will receive the injection */
  VERTEX = 1,
  /** ONLY the fragment shader will receive the injection */
  FRAGMENT = 2,
  /** Both the fragment and vertex shader will receive the injection */
  ALL = 3
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
  materialUniforms: IMaterialUniform<MaterialUniformType>[];
}

/**
 * This is the structure of a uniform generated for the sake of instancing
 */
export interface IInstancingUniform {
  name: string;
  type:
    | MaterialUniformType.FLOAT
    | MaterialUniformType.VEC2
    | MaterialUniformType.VEC3
    | MaterialUniformType.VEC4
    | MaterialUniformType.VEC4_ARRAY;
  value: ShaderIOValue;
}

/**
 * Represents a complete shader object set.
 */
export interface IShaders {
  fs: string;
  vs: string;
}

/**
 * Represents an element that has a full list of projection methods
 */
export interface IProjection {
  /** SInce projections are the views (just interface stripping functionality) we should provide the id for added flexibility to events */
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
export function NOOP() {
  /** No-op */
}

/**
 * White space character test
 */
export const whiteSpaceRegEx = /\s/g;
export const whiteSpaceCharRegEx = /\s/;
export const isWhiteSpace = whiteSpaceCharRegEx.test.bind(whiteSpaceCharRegEx);

/**
 * Newline character test
 */
export const newLineRegEx = /\r\n|\n|\r/g;
export const newLineCharRegEx = /\r\n|\n|\r/;
export const isNewline = newLineCharRegEx.test.bind(newLineCharRegEx);

/**
 * Options a layer can provide for a material
 */
export type ILayerMaterialOptions = Partial<
  Omit<MaterialOptions, "uniforms" | "vertexShader" | "fragmentShader">
>;

/**
 * A wrapper to make declaring layer material options easier and clearer
 */
export function createMaterialOptions(options: ILayerMaterialOptions) {
  return options;
}

/**
 * This is the type of picking assigned to a layer. Each mode has performance and functionality
 * tradeoffs.
 */
export enum PickType {
  /** Disable any picking methodology */
  NONE,
  /**
   * NOTE: NOT IMPLEMENTED YET
   *
   * Uses highly efficient color rendering method to detect an instance on a pixel by pixel check. Since it is
   * based on rendering, it will only select the 'visually' top most rendered instance. This means instances can be occluded
   * by other instances is an instance renders behind another.
   *
   * This is vastly more efficient and accurate than ALL. This also will be more readily supported than ALL.
   */
  SINGLE
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
 * This is the picking settings and objects to facilitate PickType.SINGLE so we can get
 * a single instance underneath the mouse.
 */
export interface ISinglePickingMetrics<T extends Instance>
  extends IPickingMetrics {
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
  // Single Picking does not require any special helper information
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
  /** The nearest found color in byte form */
  nearestColorBytes: Vec4;
  /** All colors in the data */
  allColors: number[];
}

/**
 * Diff types that an instance can go through. Used to help the system consume the diff
 * and apply it to the GL framework.
 */
export enum InstanceDiffType {
  CHANGE = 0,
  INSERT = 1,
  REMOVE = 2
}

/**
 * This is the metrics associated with a frame. Mostly dealing with timing values.
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
  /** A value in ms that expresses how long the system should wait before beginning the animation */
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
   * If you manually set values for the easing properties, then you use this to return
   * the easing object back to an automated state which is where the start value is
   * the calculated current position of the output and the delay and duration is determined
   * by the easing set to the layer's IAutomatedEasingMethod value set to the layer.
   */
  setAutomatic(): void;

  /**
   * This controls the start value of the easing. This should be used to force a starting
   * value of the animation.
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setStart(start?: Vec): void;

  /**
   * This controls of the timing of the easing equation. This should be used to adjust
   * when a value is to be adjusted
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setTiming(delay?: number, duration?: number): void;
}

/**
 * This is the minimum properties required to make all easing functions operate.
 */
export interface IEasingProps {
  /** A value in ms that expresses how long the system should wait before beginning the animation */
  delay?: number;
  /** Indicates how long the easing should take to complete in ms */
  duration: number;
  /** The end value the easing should approach */
  end: Vec;
  /** A flag indicating if the easing start value is manually set, thus prioritizing the values already set in this object */
  isManualStart?: boolean;
  /** A flag indicating if the easing timing is manually set, thus prioritizing the values already set in this object */
  isTimeSet?: boolean;
  /** The starting value of the easing object */
  start: Vec;
  /** The start time in ms the easing object utilizes */
  startTime: number;
}

/**
 * This is the Shader IO information a layer will provide.
 */
export interface IShaderInputs<T extends Instance> {
  /** Specifies how the vertices are laid out in the model. This defaults to Triangle Strip if not specified */
  drawMode?: GLSettings.Model.DrawMode;
  /** These are very frequently changing attributes and are uniform across all vertices in the model */
  instanceAttributes?: (IInstanceAttribute<T> | null)[];
  /** These are attributes that should be static on a vertex. These are considered unique per vertex. */
  vertexAttributes?: (IVertexAttribute | null)[];
  /**
   * Specify how many vertices there are per instance. If vertex count is 0, then the layer will render without
   * instancing and draw the buffers straight.
   */
  vertexCount: number;
  /** These are uniforms in the shader. These are uniform across all vertices and all instances for this layer. */
  uniforms?: (IUniform | null)[];
}

/**
 * This is the initialization of the shader.
 */
export type IShaderInitialization<T extends Instance> = IShaderInputs<T> &
  IShaders;

export interface IShaderExtension {
  header?: string;
  body?: string;
}

export type IShaderIOExtension<T extends Instance> = Partial<
  IShaderInputs<T>
> & {
  vs?: IShaderExtension;
  fs?: IShaderExtension;
};

/**
 * A convenience for making short lists of items that are of the same type, such as the
 * common scenario of [boolean, boolean, boolean, boolean]
 */
export type TypeVec<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];

/**
 * Depicts a two or three dimensional size:
 * [width, height, depth]
 */
export type Size = Vec2 | Vec3;

/**
 * When creating a surface you must make it declare a pipeline. This makes a centralized easy
 * entry point for expressively declaring how the application will utilize resources to render
 * to various scenes and contexts.
 *
 * This is also used in a reactive diff manner so elements can be easily updated/added/removed
 * by providing all of the initializer elements. Thus to add an item call the method including
 * the element you wish to create. To remove an element, simply exclude the element next time
 * you call the method.
 */
export interface IPipeline {
  /**
   * These are the resources we want available that our layers can be provided to utilize
   * for their internal processes.
   */
  resources?: BaseResourceOptions[];
  /**
   * This sets up the available scenes the surface will have to work with. Layers then can
   * reference the scene by it's scene property. The order of the scenes here is the drawing
   * order of the scenes.
   */
  scenes?: ISceneOptions[];
}

/**
 * Errors emitted by the surface
 */
export enum SurfaceErrorType {
  /** Error is thrown when no web gl context can be established for the canvas */
  NO_WEBGL_CONTEXT
}

/**
 * Errors emitted by the surface
 */
export type SurfaceError = {
  error: SurfaceErrorType;
  message: string;
};

/**
 * A numerical or string identifier. Use this type to make your intent a little clearer when you want a resource
 * identified.
 */
export type SimpleId = string | number;

/**
 * An alias for a string. Use this type to make your intent a little clearer when you want a string specifically for
 * identifying a resource.
 */
export type StringId = string;

/**
 * An alias for a number. Use this type to make your intent a little clearer when you want a number specifically for
 * identifying a resource.
 */
export type NumberId = number;

/**
 * This is a massively useful type to express an object that can have numeric or sttring identifiers in recursive
 * amounts to define an object with many pathways to various items of the same type (that can be varied by generic)
 *
 * const o: Lookup<InstanceProvider<Instance>> = {
 *   circles: new InstanceProvider<CircleInstance>(),
 *   category: {
 *     special: new InstanceProvider<LabelInstance>(),
 *   }
 * }
 */
export type Lookup<T> =
  | { [key: number]: T | Lookup<T> }
  | { [key: string]: T | Lookup<T> };
