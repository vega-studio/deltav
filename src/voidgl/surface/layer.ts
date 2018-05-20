import * as Three from 'three';
import {
  IInstanceAttribute,
  IMaterialOptions,
  InstanceAttributeSize,
  InstanceBlockIndex,
  InstanceDiffType,
  InstanceHitTest,
  InstanceIOValue,
  IPickInfo,
  IQuadTreePickingMetrics,
  IShaders,
  ISinglePickingMetrics,
  IUniform,
  IUniformInternal,
  IVertexAttribute,
  IVertexAttributeInternal,
  PickType,
  ShaderInjectionTarget,
  UniformIOValue,
  UniformSize,
} from '../types';
import { BoundsAccessor, TrackedQuadTree } from '../util';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { Instance } from '../util/instance';
import { InstanceUniformManager } from '../util/instance-uniform-manager';
import { DiffLookup, InstanceDiffManager } from './instance-diff-manager';
import { LayerInteractionHandler } from './layer-interaction-handler';
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

export type IShaderInitialization<T extends Instance> = IShaderInputs<T> & IShaders;

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

  // ---- EVENTS ----
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
  new (geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material []): any;
}

export interface IPickingMethods<T extends Instance> {
  /** This provides a way to calculate bounds of an Instance */
  boundsAccessor: BoundsAccessor<T>,
  /** This is the way the system tests hitting an intsance */
  hitTest: InstanceHitTest<T>,
}

/**
 * A base class for generating drawable content
 */
export class Layer<T extends Instance, U extends ILayerProps<T>, V> extends IdentifyByKey {
  static defaultProps: any = {};

  /** This is the attribute that specifies the _active flag for an instance */
  activeAttribute: IInstanceAttribute<T>;
  /** This determines the drawing order of the layer within it's scene */
  depth: number = 0;
  /** This is the threejs geometry filled with the vertex information */
  geometry: Three.BufferGeometry;
  /** This is all of the instance attributes generated for the layer */
  instanceAttributes: IInstanceAttribute<T>[];
  /** A lookup fo an instance by it's ID */
  instanceById = new Map<string, T>();
  /** Provides the number of vertices a single instance spans */
  instanceVertexCount: number = 0;
  /** This is the handler that manages interactions for the layer */
  interactions: LayerInteractionHandler<T, U, V>;
  /** The official shader material generated for the layer */
  material: Three.RawShaderMaterial;
  /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
  maxInstancesPerBuffer: number;
  /** This is the mesh for the Threejs setup */
  model: Three.Object3D;
  /** This is all of the picking metrics kept for handling picking scenarios */
  picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics;
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

  /** This contains the methods and controls for handling diffs for the layer */
  diffManager: InstanceDiffManager<T>;
  /** This takes a diff and applies the proper method of change for the diff with quad tree changes */
  diffProcessor: DiffLookup<T>;

  constructor(props: ILayerProps<T>) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(props);
    // Keep our props within the layer
    this.props = Object.assign({}, Layer.defaultProps || {}, props as U);
    // Set up the pick type for the layer
    const { picking = PickType.NONE } = this.props;

    // If ALL is specified we set up QUAD tree picking for our instances
    if (picking === PickType.ALL) {
      const pickingMethods = this.getInstancePickingMethods();

      this.picking = {
        hitTest: pickingMethods.hitTest,
        quadTree: new TrackedQuadTree<T>(0, 1, 0, 1, pickingMethods.boundsAccessor),
        type: PickType.ALL,
      };
    }

    this.diffManager = new InstanceDiffManager<T>(this);
    this.diffProcessor = this.diffManager.getDiffProcessor();
    this.interactions = new LayerInteractionHandler(this);
  }

  /**
   * Invalidate and free all resources assocated with this layer.
   */
  destroy() {
    this.uniformManager.destroy();
  }

  didUpdateProps() {
    /** LIFECYCLE */
  }

  /**
   * This is where global uniforms should update their values. Executes every frame.
   */
  draw() {
    let uniform: IUniformInternal;
    let value: UniformIOValue;

    // Consume the diffs for the instances to update each element
    const changeList = this.props.data.changeList;
    // Make some holder variables to prevent declaration within the loop
    let change, instance, uniforms;
    // Fast ref to the processor and manager
    const diffProcessor = this.diffProcessor;
    const diffManager = this.diffManager;

    for (let i = 0, end = changeList.length; i < end; ++i) {
      change = changeList[i];
      instance = change[0];
      uniforms = this.uniformManager.getUniforms(instance);
      // The diff type is change[1] which we use to find the diff processing method to use
      diffProcessor[change[1]](diffManager, instance, uniforms);
    }

    // Indicate the diffs are consumed
    this.props.data.resolve();

    // Loop through the uniforms that are across all instances
    for (let i = 0, end = this.uniforms.length; i < end; ++i) {
      uniform = this.uniforms[i];
      value = uniform.update(uniform);
      uniform.materialUniforms.forEach(materialUniform => materialUniform.value = value);
    }
  }

  /**
   * This method is for layers to implement to specify how the bounds for an instance are retrieved or
   * calculated and how the Instance interacts with a point. This is REQUIRED to support PickType.ALL on the layer.
   */
  getInstancePickingMethods(): IPickingMethods<T> {
    throw new Error('When picking is set to PickType.ALL, the layer MUST have this method implemented; otherwise, the layer is incompatible with this picking mode.');
  }

  /**
   * The type of Three model as well as the preferred draw mode associated with it.
   */
  getModelType(): IModelType {
    return {
      drawMode: Three.TrianglesDrawMode,
      modelType: Three.Mesh,
    };
  }

  /**
   * The options for a three material without uniforms.
   */
  getMaterialOptions(): IMaterialOptions {
    return {};
  }

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
  initShader(): IShaderInitialization<T> {
    return {
      fs: require('../shaders/base/no-op.fs'),
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      vertexCount: 0,
      vs: require('../shaders/base/no-op.vs'),
    };
  }

  /**
   * Helper method for making an instance attribute. Depending on set up, this makes creating elements
   * have better documentation when typing out the elements.
   */
  makeInstanceAttribute(
    block: number,
    blockIndex: InstanceBlockIndex,
    name: string,
    size: InstanceAttributeSize,
    update: (o: T) => InstanceIOValue,
    atlas?: {
      key: string;
      name: string;
      shaderInjection?: ShaderInjectionTarget;
    },
  ): IInstanceAttribute<T> {
    return {
      atlas,
      block,
      blockIndex,
      name,
      size,
      update,
    };
  }

  /**
   * Helper method for making a uniform type. Depending on set up, this makes creating elements
   * have better documentation when typing out the elements.
   */
  makeUniform(name: string, size: UniformSize, update: (o: IUniform) => UniformIOValue, shaderInjection?: ShaderInjectionTarget, qualifier?: string): IUniform {
    return {
      name,
      qualifier,
      shaderInjection,
      size,
      update,
    };
  }

  willUpdateInstances(changes: [T, InstanceDiffType]) {
    // HOOK: Simple hook so a class can review all of it's changed instances before
    //       Getting applied to the Shader IO
  }

  willUpdateProps(newProps: ILayerProps<T>) {
    /** LIFECYCLE */
  }

  didUpdate() {
    this.props.data.resolve();
  }
}
