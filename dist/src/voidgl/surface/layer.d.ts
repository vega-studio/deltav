import * as Three from 'three';
import { IInstanceAttribute, IMaterialOptions, INonePickingMetrics, InstanceAttributeSize, InstanceBlockIndex, InstanceDiffType, InstanceHitTest, InstanceIOValue, IPickInfo, IQuadTreePickingMetrics, IShaders, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, PickType, ShaderInjectionTarget, UniformIOValue, UniformSize } from '../types';
import { BoundsAccessor } from '../util';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { Instance } from '../util/instance';
import { InstanceUniformManager } from '../util/instance-uniform-manager';
import { DiffLookup, InstanceDiffManager } from './instance-diff-manager';
import { LayerInteractionHandler } from './layer-interaction-handler';
import { LayerSurface } from './layer-surface';
import { AtlasResourceManager } from './texture/atlas-resource-manager';
import { View } from './view';
export interface IShaderInputs<T extends Instance> {
    /** These are very frequently changing attributes and are uniform across all vertices in the model */
    instanceAttributes?: (IInstanceAttribute<T> | null)[];
    /** These are attributes that should be static on a vertex. These are considered unique per vertex. */
    vertexAttributes?: (IVertexAttribute | null)[];
    /** Specify how many vertices there are per instance */
    vertexCount: number;
    /** These are uniforms in the shader. These are uniform across all vertices and all instances for this layer. */
    uniforms?: (IUniform | null)[];
}
export declare type IShaderInitialization<T extends Instance> = IShaderInputs<T> & IShaders;
export interface IModelType {
    /** This is the draw type of the model to be used */
    drawMode?: Three.TrianglesDrawModes;
    /** This is the THREE JS model type */
    modelType: IModelConstructable;
}
/**
 * Bare minimum required features a provider must provide to be the data for the layer.
 */
export interface IInstanceProvider<T extends Instance> {
    /** A list of changes to instances */
    changeList: [T, InstanceDiffType][];
    /** Resolves the changes as consumed */
    resolve(): void;
}
/**
 * Constructor options when generating a layer.
 */
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    /** This is the data provider where the instancing data is injected and modified. */
    data: IInstanceProvider<T>;
    /**
     * This sets how instances can be picked via the mouse. This activates the mouse events for the layer IFF
     * the value is not NONE.
     */
    picking?: PickType;
    /**
     * This identifies the scene we want the layer to be a part of.
     * Layer's with the same identifiers will render their buffers in the same scene.
     * This only applies to the layer when the layer is initialized in a layer surface. You shouldn't
     * be swapping layers from scene to scene.
     *
     * The scene identifier must be an identifier used when constructing the layer surface that this layer
     * is added to.
     */
    scene?: string;
    /** Executes when the mouse is down on instances and a picking type is set */
    onMouseDown?(info: IPickInfo<T>): void;
    /** Executes when the mouse moves on instances and a picking type is set */
    onMouseMove?(info: IPickInfo<T>): void;
    /** Executes when the mouse no longer over instances and a picking type is set */
    onMouseOut?(info: IPickInfo<T>): void;
    /** Executes when the mouse is newly over instances and a picking type is set */
    onMouseOver?(info: IPickInfo<T>): void;
    /** Executes when the mouse button is release when over instances and a picking type is set */
    onMouseUp?(info: IPickInfo<T>): void;
    /** Executes when the mouse click gesture is executed over instances and a picking type is set */
    onMouseClick?(info: IPickInfo<T>): void;
}
export interface IModelConstructable {
    new (geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material[]): any;
}
export interface IPickingMethods<T extends Instance> {
    /** This provides a way to calculate bounds of an Instance */
    boundsAccessor: BoundsAccessor<T>;
    /** This is the way the system tests hitting an intsance */
    hitTest: InstanceHitTest<T>;
}
/**
 * A base class for generating drawable content
 */
export declare class Layer<T extends Instance, U extends ILayerProps<T>> extends IdentifyByKey {
    static defaultProps: any;
    /** This is the attribute that specifies the _active flag for an instance */
    activeAttribute: IInstanceAttribute<T>;
    /** This determines the drawing order of the layer within it's scene */
    depth: number;
    /** This is the threejs geometry filled with the vertex information */
    geometry: Three.BufferGeometry;
    /** This is all of the instance attributes generated for the layer */
    instanceAttributes: IInstanceAttribute<T>[];
    /** A lookup fo an instance by it's ID */
    instanceById: Map<string, T>;
    /** Provides the number of vertices a single instance spans */
    instanceVertexCount: number;
    /** This is the handler that manages interactions for the layer */
    interactions: LayerInteractionHandler<T, U>;
    /** The official shader material generated for the layer */
    material: Three.RawShaderMaterial;
    /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
    maxInstancesPerBuffer: number;
    /** This is the mesh for the Threejs setup */
    model: Three.Object3D;
    /** This is all of the picking metrics kept for handling picking scenarios */
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
    /** Properties handed to the Layer during a LayerSurface render */
    props: U;
    /** This is the system provided resource manager that lets a layer request Atlas resources */
    resource: AtlasResourceManager;
    /** This is the surface this layer is generated under */
    surface: LayerSurface;
    /** This is all of the uniforms generated for the layer */
    uniforms: IUniformInternal[];
    /** This matches an instance to the list of Three uniforms that the instance is responsible for updating */
    uniformManager: InstanceUniformManager<T>;
    /** This is all of the vertex attributes generated for the layer */
    vertexAttributes: IVertexAttributeInternal[];
    /** This is the view the layer is applied to. The system sets this, modifying will only cause sorrow. */
    view: View;
    /** This contains the methods and controls for handling diffs for the layer */
    diffManager: InstanceDiffManager<T>;
    /** This takes a diff and applies the proper method of change for the diff with quad tree changes */
    diffProcessor: DiffLookup<T>;
    constructor(props: ILayerProps<T>);
    /**
     * Invalidate and free all resources assocated with this layer.
     */
    destroy(): void;
    didUpdateProps(): void;
    /**
     * This is where global uniforms should update their values. Executes every frame.
     */
    draw(): void;
    /**
     * This method is for layers to implement to specify how the bounds for an instance are retrieved or
     * calculated and how the Instance interacts with a point. This is REQUIRED to support PickType.ALL on the layer.
     */
    getInstancePickingMethods(): IPickingMethods<T>;
    /**
     * The type of Three model as well as the preferred draw mode associated with it.
     */
    getModelType(): IModelType;
    /**
     * The options for a three material without uniforms.
     */
    getMaterialOptions(): IMaterialOptions;
    /**
     * This sets up all of the data bindings that will transport data from the CPU
     * to the Shader on the GPU.
     *
     * Instance Attributes: These are very frequently changing attributes
     * Vertex Attributes: These are attributes that should be static on a vertex. Conisder it very costly to update.
     *                    The only time making these modifieable is in the event of GL_POINTS.
     * Uniforms: These set up the uniforms for the layer, thus having all normal implications of a uniform. Global
     *           across the fragment and vertex shaders and can be modified with little consequence.
     */
    initShader(): IShaderInitialization<T>;
    /**
     * Helper method for making an instance attribute. Depending on set up, this makes creating elements
     * have better documentation when typing out the elements.
     */
    makeInstanceAttribute(block: number, blockIndex: InstanceBlockIndex, name: string, size: InstanceAttributeSize, update: (o: T) => InstanceIOValue, atlas?: {
        key: string;
        name: string;
        shaderInjection?: ShaderInjectionTarget;
    }): IInstanceAttribute<T>;
    /**
     * Helper method for making a uniform type. Depending on set up, this makes creating elements
     * have better documentation when typing out the elements.
     */
    makeUniform(name: string, size: UniformSize, update: (o: IUniform) => UniformIOValue, shaderInjection?: ShaderInjectionTarget, qualifier?: string): IUniform;
    willUpdateInstances(changes: [T, InstanceDiffType]): void;
    willUpdateProps(newProps: ILayerProps<T>): void;
    didUpdate(): void;
}
