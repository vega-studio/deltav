import * as Three from "three";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import {
  IInstanceAttribute,
  IMaterialOptions,
  INonePickingMetrics,
  InstanceAttributeSize,
  InstanceBlockIndex,
  InstanceDiffType,
  InstanceHitTest,
  InstanceIOValue,
  IPickInfo,
  IQuadTreePickingMetrics,
  IShaderInitialization,
  ISinglePickingMetrics,
  IUniform,
  IUniformInternal,
  IVertexAttributeInternal,
  PickType,
  ShaderInjectionTarget,
  UniformIOValue,
  UniformSize
} from "../types";
import { BoundsAccessor, TrackedQuadTree } from "../util";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import {
  BufferManagerBase,
  IBufferLocation
} from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerBufferType } from "./layer-processing/layer-buffer-type";
import { LayerInitializer, LayerSurface } from "./layer-surface";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
import { View } from "./view";

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
  changeList: InstanceDiff<T>[];
  /** Resolves the changes as consumed */
  resolve(): void;
  /** Forces the provider to make a change list that ensures all elements are added */
  sync(): void;
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
   * Used for debugging. Logs the generated shader for the layer in the console.
   */
  printShader?: boolean;
  /**
   * This identifies the scene we want the layer to be a part of.
   * Layer's with the same identifiers will render their buffers in the same scene.
   * This only applies to the layer when the layer is initialized in a layer surface. You shouldn't
   * be swapping layers from scene to scene.
   *
   * The scene identifier must be an identifier used when constructing the layer surface that this layer
   * is added to.
   */
  scene: string;

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
  new (
    geometry?: Three.Geometry | Three.BufferGeometry,
    material?: Three.Material | Three.Material[]
  ): any;
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
export class Layer<
  T extends Instance,
  U extends ILayerProps<T>
> extends IdentifyByKey {
  /** This MUST be implemented by sublayers in order for proper code hinting to happen */
  static defaultProps: any = {};

  /** This is the attribute that specifies the _active flag for an instance */
  activeAttribute: IInstanceAttribute<T>;
  /** This matches an instance to the list of Three uniforms that the instance is responsible for updating */
  private _bufferManager: BufferManagerBase<T, IBufferLocation>;
  /** Buffer manager is read only. Must use setBufferManager */
  get bufferManager() {
    return this._bufferManager;
  }
  /** This is the determined buffering strategy of the layer */
  private _bufferType: LayerBufferType;
  /** Buffer type is private and should not be directly modified */
  get bufferType() {
    return this._bufferType;
  }
  /** This determines the drawing order of the layer within it's scene */
  depth: number = 0;
  /** This contains the methods and controls for handling diffs for the layer */
  diffManager: InstanceDiffManager<T>;
  /**
   * This gets populated when there are attributes that have easing applied to them. This
   * subsequently gets applied to instances when they get added to the layer.
   */
  easingId: { [key: string]: number };
  /** This is the threejs geometry filled with the vertex information */
  geometry: Three.BufferGeometry;
  /** This is the initializer used when making this layer. */
  initializer: LayerInitializer;
  /** This is all of the instance attributes generated for the layer */
  instanceAttributes: IInstanceAttribute<T>[];
  /** A lookup fo an instance by it's ID */
  instanceById = new Map<string, T>();
  /** Provides the number of vertices a single instance spans */
  instanceVertexCount: number = 0;
  /** This is the handler that manages interactions for the layer */
  interactions: LayerInteractionHandler<T, U>;
  /** The official shader material generated for the layer */
  material: Three.RawShaderMaterial;
  /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
  maxInstancesPerBuffer: number;
  /** This is the mesh for the Threejs setup */
  model: Three.Object3D;
  /** This is all of the picking metrics kept for handling picking scenarios */
  picking:
    | IQuadTreePickingMetrics<T>
    | ISinglePickingMetrics<T>
    | INonePickingMetrics;
  /** Properties handed to the Layer during a LayerSurface render */
  props: U;
  /** This is the system provided resource manager that lets a layer request Atlas resources */
  resource: AtlasResourceManager;
  /** This is the surface this layer is generated under */
  surface: LayerSurface;
  /** This is all of the uniforms generated for the layer */
  uniforms: IUniformInternal[];
  /** This is all of the vertex attributes generated for the layer */
  vertexAttributes: IVertexAttributeInternal[];
  /** This is the view the layer is applied to. The system sets this, modifying will only cause sorrow. */
  view: View;

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
        currentPickMode: PickType.NONE,
        hitTest: pickingMethods.hitTest,
        quadTree: new TrackedQuadTree<T>(
          0,
          1,
          0,
          1,
          pickingMethods.boundsAccessor
        ),
        type: PickType.ALL
      };
    } else if (picking === PickType.SINGLE) {
      this.picking = {
        currentPickMode: PickType.NONE,
        type: PickType.SINGLE,
        uidToInstance: new Map<number, T>()
      };
    } else {
      this.picking = {
        currentPickMode: PickType.NONE,
        type: PickType.NONE
      };
    }
  }

  /**
   * Invalidate and free all resources assocated with this layer.
   */
  destroy() {
    if (this.bufferManager) {
      if (this.bufferManager.scene) this.bufferManager.scene.removeLayer(this);
      this.bufferManager.removeFromScene();
      this.bufferManager.destroy();
    }
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
    let change, instance, bufferLocations;
    // Fast ref to the processor and manager
    const diffManager = this.diffManager;
    const processing = diffManager.processing;
    const processor = diffManager.processor;

    // Forewarn the processor how many instances are flagged for a change.
    processor.incomingChangeList(changeList);

    for (let i = 0, end = changeList.length; i < end; ++i) {
      change = changeList[i];
      instance = change[0];
      bufferLocations = this.bufferManager.getBufferLocations(instance);
      // The diff type is change[1] which we use to find the diff processing method to use
      processing[change[1]](
        processor,
        instance,
        Object.values(change[2]),
        bufferLocations
      );
      // Clear the changes for the instance
      instance.changes = {};
    }

    // Tell the diff processor that it has completed it's task set
    processor.commit();
    // Indicate the diffs are consumed
    this.props.data.resolve();

    // Loop through the uniforms that are across all instances
    for (let i = 0, end = this.uniforms.length; i < end; ++i) {
      uniform = this.uniforms[i];
      value = uniform.update(uniform);
      uniform.materialUniforms.forEach(
        materialUniform => (materialUniform.value = value)
      );
    }
  }

  /**
   * This method is for layers to implement to specify how the bounds for an instance are retrieved or
   * calculated and how the Instance interacts with a point. This is REQUIRED to support PickType.ALL on the layer.
   */
  getInstancePickingMethods(): IPickingMethods<T> {
    throw new Error(
      "When picking is set to PickType.ALL, the layer MUST have this method implemented; otherwise, the layer is incompatible with this picking mode."
    );
  }

  /**
   * The type of Three model as well as the preferred draw mode associated with it.
   */
  getModelType(): IModelType {
    return {
      drawMode: Three.TrianglesDrawMode,
      modelType: Three.Mesh
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
      fs: require("../shaders/base/no-op.fs"),
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      vertexCount: 0,
      vs: require("../shaders/base/no-op.vs")
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
    }
  ): IInstanceAttribute<T> {
    return {
      atlas,
      block,
      blockIndex,
      name,
      size,
      update
    };
  }

  /**
   * Helper method for making a uniform type. Depending on set up, this makes creating elements
   * have better documentation when typing out the elements.
   */
  makeUniform(
    name: string,
    size: UniformSize,
    update: (o: IUniform) => UniformIOValue,
    shaderInjection?: ShaderInjectionTarget,
    qualifier?: string
  ): IUniform {
    return {
      name,
      qualifier,
      shaderInjection,
      size,
      update
    };
  }

  /**
   * Applies a buffer manager to the layer which handles instance changes and applies those changes
   * to an appropriate buffer at the appropriate location.
   */
  setBufferManager(bufferManager: BufferManagerBase<T, IBufferLocation>) {
    if (!this._bufferManager) {
      this._bufferManager = bufferManager;
      this.diffManager = new InstanceDiffManager<T>(this, bufferManager);
      this.diffManager.makeProcessor();
      this.interactions = new LayerInteractionHandler(this);
    } else {
      console.warn(
        "You can not change a layer's buffer strategy once it has been instantiated."
      );
    }
  }

  /**
   * Only allows the buffer type to be set once
   */
  setBufferType(val: LayerBufferType) {
    if (this._bufferType === undefined) {
      this._bufferType = val;
    } else {
      console.warn(
        "You can not change a layers buffer strategy once it has been instantiated."
      );
    }
  }

  willUpdateInstances(_changes: [T, InstanceDiffType]) {
    // HOOK: Simple hook so a class can review all of it's changed instances before
    //       Getting applied to the Shader IO
  }

  willUpdateProps(_newProps: ILayerProps<T>) {
    /** LIFECYCLE */
  }

  didUpdate() {
    this.props.data.resolve();
  }
}
