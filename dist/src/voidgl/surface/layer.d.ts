import * as Three from 'three';
import { View } from '../surface/view';
import { IInstanceAttribute, IMaterialOptions, IPickInfo, IShaders, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal } from '../types';
import { DataProvider, DiffType } from '../util/data-provider';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { Instance } from '../util/instance';
import { InstanceUniformManager, IUniformInstanceCluster } from '../util/instance-uniform-manager';
import { AtlasResourceManager } from './texture/atlas-resource-manager';
export interface IShaderInputs<T> {
    /** These are very frequently changing attributes and are uniform across all vertices in the model */
    instanceAttributes?: IInstanceAttribute<T>[];
    /** These are attributes that should be static on a vertex. These are considered unique per vertex. */
    vertexAttributes?: IVertexAttribute[];
    /** Specify how many vertices there are per instance */
    vertexCount: number;
    /** These are uniforms in the shader. These are uniform across all vertices and all instances for this layer. */
    uniforms?: IUniform[];
}
export declare type IShaderInitialization<T> = IShaderInputs<T> & IShaders;
export interface IModelType {
    /** This is the draw type of the model to be used */
    drawMode?: Three.TrianglesDrawModes;
    /** This is the THREE JS model type */
    modelType: IModelConstructable;
}
/**
 * Constructor options when generating a layer.
 */
export interface ILayerProps<T extends Instance> extends IdentifyByKeyOptions {
    /** This is the data provider where the instancing data is injected and modified. */
    data: DataProvider<T>;
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
    /** Set this to respond to pick events on the instances rendered */
    onMouseOver?(info: IPickInfo<T, any, any>): void;
}
export interface IModelConstructable {
    new (geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material[]): any;
}
/**
 * A base class for generating drawable content
 */
export declare class Layer<T extends Instance, U extends ILayerProps<T>, V> extends IdentifyByKey {
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
    /** The official shader material generated for the layer */
    material: Three.RawShaderMaterial;
    /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
    maxInstancesPerBuffer: number;
    /** This is the mesh for the Threejs setup */
    model: Three.Object3D;
    /** This is the system provided resource manager that lets a layer request Atlas resources */
    resource: AtlasResourceManager;
    /** This is all of the uniforms generated for the layer */
    uniforms: IUniformInternal[];
    /** This matches an instance to the list of Three uniforms that the instance is responsible for updating */
    uniformManager: InstanceUniformManager<T>;
    /** This is all of the vertex attributes generated for the layer */
    vertexAttributes: IVertexAttributeInternal[];
    /** This is the view the layer is applied to. The system sets this, modifying will only cause sorrow. */
    view: View;
    props: U;
    state: V;
    /**
     * This processes add operations from changes in the instancing data
     */
    private addInstance;
    /**
     * This processes change operations from changes in the instancing data
     */
    private changeInstance;
    /**
     * This processes remove operations from changes in the instancing data
     */
    private removeInstance;
    /** This takes a diff and applies the proper method of change for the diff */
    diffProcessor: {
        [key: number]: (instance: T, uniformCluster: IUniformInstanceCluster) => void;
    };
    constructor(props: ILayerProps<T>);
    private updateInstance(instance, uniformCluster);
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
    willUpdateInstances(changes: [T, DiffType]): void;
    willUpdateProps(newProps: ILayerProps<T>): void;
    didUpdate(): void;
}
