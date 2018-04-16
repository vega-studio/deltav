import * as Three from 'three';
import { ShaderInjectionTarget } from '..';
import { View } from '../surface/view';
import { IInstanceAttribute, IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, InstanceIOValue, IPickInfo, IShaders, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, UniformSize } from '../types';
import { UniformIOValue } from '../types';
import { DataProvider, DiffType } from '../util/data-provider';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { Instance } from '../util/instance';
import { InstanceUniformManager, IUniformInstanceCluster } from '../util/instance-uniform-manager';
import { AtlasResourceManager } from './texture/atlas-resource-manager';

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

  // ---- EVENTS ----
  /** Set this to respond to pick events on the instances rendered */
  onMouseOver?(info: IPickInfo<T, any, any>): void;
}

export interface IModelConstructable {
  new (geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material []): any;
}

const VECTOR_ACCESSORS: (keyof Three.Vector4)[] = ['x', 'y', 'z', 'w'];

// We declare any fill vector properties needed out here to maximize optimization
// @ts-ignore: variable-name
let _I_, _END_;

function fillVector(vec: Three.Vector4, start: number, values: number[]) {
  for (_I_ = start, _END_ = values.length + start; _I_ < _END_; ++_I_) {
    vec[VECTOR_ACCESSORS[_I_]] = values[_I_ - start];
  }
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
  private addInstance(layer: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (uniformCluster) {
      layer.changeInstance(layer, instance, uniformCluster);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const uniforms = layer.uniformManager.add(instance);
      instance.active = true;
      layer.updateInstance(instance, uniforms);
    }
  }

  /**
   * This processes change operations from changes in the instancing data
   */
  private changeInstance(layer: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (uniformCluster) {
      layer.updateInstance(instance, uniformCluster);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
      layer.addInstance(layer, instance, uniformCluster);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  private removeInstance(layer: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    if (uniformCluster) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
      // We do one last update on the instance to update to it's deactivated state
      layer.updateInstance(instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      layer.uniformManager.remove(instance);
    }
  }

  /** This takes a diff and applies the proper method of change for the diff */
  diffProcessor = [
    this.changeInstance,
    this.addInstance,
    this.removeInstance,
  ];

  constructor(props: ILayerProps<T>) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(props);
    // Keep our props within the layer
    this.props = Object.assign({}, Layer.defaultProps || {}, props as U);
  }

  private updateInstance(instance: T, uniformCluster: IUniformInstanceCluster) {
    if (instance.active) {
      const uniforms = uniformCluster.uniform;
      const uniformRangeStart = uniformCluster.uniformRange[0];
      const instanceData: Three.Vector4[] = uniforms.value;
      let instanceUniform, value, block, start;
      let k, endk;

      // Loop through the instance attributes and update the uniform cluster with the valaues
      // Calculated for the instance
      for (let i = 0, end = this.instanceAttributes.length; i < end; ++i) {
        instanceUniform = this.instanceAttributes[i];
        value = instanceUniform.update(instance);
        block = instanceData[uniformRangeStart + instanceUniform.block];
        instanceUniform.atlas && this.resource.setTargetAtlas(instanceUniform.atlas.key);
        start = instanceUniform.blockIndex;

        // Hyper optimized vector filling routine. It uses properties that are globally scoped
        // To greatly reduce overhead
        for (k = start, endk = value.length + start; k < endk; ++k) {
          block[VECTOR_ACCESSORS[k]] = value[k - start];
        }
      }

      uniforms.value = instanceData;
    }

    else {
      const uniforms: Three.IUniform = uniformCluster.uniform;
      const uniformRangeStart = uniformCluster.uniformRange[0];
      const instanceData: Three.Vector4[] = uniforms.value;
      let instanceUniform, value, block;

      // Only update the _active attribute to ensure it is false. When it is false, there is no
      // Point to updating any other uniform
      instanceUniform = this.activeAttribute;
      value = instanceUniform.update(instance);
      block = instanceData[uniformRangeStart + instanceUniform.block];
      instanceUniform.atlas && this.resource.setTargetAtlas(instanceUniform.atlas.key);
      fillVector(block, instanceUniform.blockIndex, value);

      uniforms.value = instanceData;
    }
  }

  /**
   * Invalidate and free all resources assocated with this layer.
   */
  destroy() {
    /** TODO: no-op for now */
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
    // Fast ref to the processor
    const diffProcessor = this.diffProcessor;

    for (let i = 0, end = changeList.length; i < end; ++i) {
      change = changeList[i];
      instance = change[0];
      uniforms = this.uniformManager.getUniforms(instance);
      // The diff type is change[1] which we use to find the diff processing method to use
      diffProcessor[change[1]](this, instance, uniforms);
    }

    // Indicate the diffs are consumed
    this.props.data.resolve();

    // Loop through the uniforms that are across all instances
    for (let i = 0, end = this.uniforms.length - 1; i < end; ++i) {
      uniform = this.uniforms[i];
      value = uniform.update(uniform);
      uniform.materialUniforms.forEach(materialUniform => materialUniform.value = value);
    }
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

  willUpdateInstances(changes: [T, DiffType]) {
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
