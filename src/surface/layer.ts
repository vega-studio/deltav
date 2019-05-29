import { Geometry } from "../gl/geometry";
import { Material } from "../gl/material";
import { Model } from "../gl/model";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import { ObservableMonitoring } from "../instance-provider/observable";
import { ResourceRouter } from "../resources";
import { ShaderProcessor } from "../shaders/processing/shader-processor";
import {
  IInstanceAttribute,
  ILayerMaterialOptions,
  INonePickingMetrics,
  InstanceDiffType,
  InstanceHitTest,
  IPickInfo,
  IQuadTreePickingMetrics,
  IShaderInitialization,
  ISinglePickingMetrics,
  IUniform,
  IUniformInternal,
  IVertexAttributeInternal,
  PickType,
  UniformIOValue
} from "../types";
import { TrackedQuadTree, TrackedQuadTreeBoundsAccessor, uid } from "../util";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import {
  BufferManagerBase,
  IBufferLocation
} from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { generateLayerGeometry } from "./layer-processing/generate-layer-geometry";
import { generateLayerMaterial } from "./layer-processing/generate-layer-material";
import { generateLayerModel } from "./layer-processing/generate-layer-model";
import {
  LayerBufferType,
  makeLayerBufferManager
} from "./layer-processing/layer-buffer-type";
import { LayerScene } from "./layer-scene";
import { LayerInitializer, Surface } from "./surface";
import { View } from "./view";

const debug = require("debug")("performance");

export function createUniform(options: IUniform) {
  return options;
}

/**
 * Bare minimum required features a provider must provide to be the data for the layer.
 */
export interface IInstanceProvider<T extends Instance> {
  /**
   * This indicates the context this provider was handled within. Currently, only one context is allowed per provider,
   * so we use this to detect when multiple contexts have attempted use of this provider.
   */
  resolveContext: string;
  /** A unique number making it easier to identify this object */
  uid: number;
  /** A list of changes to instances */
  changeList: InstanceDiff<T>[];
  /** Removes an instance from the list */
  remove(instance: T): void;
  /** Resolves the changes as consumed */
  resolve(context: string): void;
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
   * Any pipeline declaring a layer cn manipulate a layer's default material settings as every pipeline
   * can have some specific and significant needs the layer does not provide as a default.
   */
  materialOptions?: ILayerMaterialOptions;
  /** Helps guarantee a rendering order for the layers. Lower numbers render first */
  order?: number;
  /**
   * This sets how instances can be picked via the mouse. This activates the mouse events for the layer IFF
   * the value is not NONE.
   */
  picking?: PickType;
  /**
   * Used for debugging. Logs the generated shader for the layer in the console.
   */
  printShader?: boolean;

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

/**
 * Layer properties that contains internal system values
 */
export interface ILayerPropsInternal<T extends Instance>
  extends ILayerProps<T> {
  /** The system provides this for the layer when the layer is being produced as a child of another layer */
  parent?: Layer<Instance, ILayerProps<Instance>>;
}

export interface IPickingMethods<T extends Instance> {
  /** This provides a way to calculate bounds of an Instance */
  boundsAccessor: TrackedQuadTreeBoundsAccessor<T>;
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
  /**
   * Calculated end time of all animations that will take place. This will cause the system to keep rendering
   * and not go into an idle state until the time of the last rendered frame has exceeded the time flagged
   * here.
   */
  animationEndTime: number = 0;
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
  /** When a layer creates children, this is populated with those children */
  children?: Layer<Instance, ILayerProps<Instance>>[];
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
  geometry: Geometry;
  /** This is the initializer used when making this layer. */
  initializer: LayerInitializer;
  /** This is all of the instance attributes generated for the layer */
  instanceAttributes: IInstanceAttribute<T>[] = [];
  /** Provides the number of vertices a single instance spans */
  instanceVertexCount: number = 0;
  /** This is the handler that manages interactions for the layer */
  interactions: LayerInteractionHandler<T, U>;
  /** The last time stamp this layer had its contents rendered */
  lastFrameTime: number = 0;
  /** The official shader material generated for the layer */
  material: Material;
  /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
  maxInstancesPerBuffer: number;
  /** Default model configuration for rendering in the gl layer */
  model: Model;
  /** This indicates whether this layer needs to draw */
  needsViewDrawn: boolean = false;
  /** Helps assert rendering order. Lower numbers render first. */
  order?: number;
  /** If this is populated, then this layer is the product of a parent producing this layer. */
  parent?: Layer<Instance, ILayerProps<Instance>>;
  /** This is all of the picking metrics kept for handling picking scenarios */
  picking:
    | IQuadTreePickingMetrics<T>
    | ISinglePickingMetrics<T>
    | INonePickingMetrics;
  /** Properties handed to the Layer during a Surface render */
  props: U;
  /** This is the system provided resource manager that lets a layer request Atlas resources */
  resource: ResourceRouter;
  /** This is the layer scene this layer feeds into */
  scene: LayerScene;
  /** This is the surface this layer is generated under */
  surface: Surface;
  /** This is all of the uniforms generated for the layer */
  uniforms: IUniformInternal[] = [];
  /** A uid provided to the layer to give it some uniqueness as an object */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();
  /** This is all of the vertex attributes generated for the layer */
  vertexAttributes: IVertexAttributeInternal[] = [];
  /** This is the view the layer is applied to. The system sets this, modifying will only cause sorrow. */
  view: View;
  /** This flag indicates if the layer will be reconstructed from scratch next layer rendering cycle */
  willRebuildLayer: boolean = false;

  constructor(surface: Surface, scene: LayerScene, props: ILayerProps<T>) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(props);
    // Keep track of the surface this layer resides beneath
    this.surface = surface;
    // Track the parent Layer Scene this layer is under
    this.scene = scene;
    // Keep our props within the layer
    this.props = Object.assign({}, Layer.defaultProps || {}, props as U);
  }

  /**
   * This does special initialization by gathering the layers shader IO, generates a material
   * and injects special automated uniforms and attributes to make instancing work for the
   * shader.
   */
  init() {
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

    // Set the resource manager this surface utilizes to the layer
    this.resource = this.surface.resourceManager;
    // Get the shader metrics the layer desires
    const shaderIO = this.initShader();
    // Ensure the layer has interaction handling applied to it
    this.interactions = new LayerInteractionHandler(this);

    // If no metrics are provided, this layer is merely a shell layer and will not
    // receive any GPU handling objects.
    if (!shaderIO) {
      this.picking.type = PickType.NONE;
      debug(
        "Shell layer initialized. Nothing will be rendered for this layer",
        this.id
      );
      return true;
    }

    if (!shaderIO.fs || !shaderIO.vs) {
      console.warn(
        "Layer needs to specify the fragment and vertex shaders:",
        this.id
      );
      return false;
    }

    // Clean out nulls provided as a convenience to the layer
    shaderIO.instanceAttributes = (shaderIO.instanceAttributes || []).filter(
      Boolean
    );
    shaderIO.vertexAttributes = (shaderIO.vertexAttributes || []).filter(
      Boolean
    );
    shaderIO.uniforms = (shaderIO.uniforms || []).filter(Boolean);

    // Generate the actual shaders to be used by injecting all of the necessary fragments and injecting
    // Instancing fragments
    const shaderMetrics = new ShaderProcessor().process(
      this,
      shaderIO,
      this.surface.getIOExpanders(),
      this.surface.getIOSorting()
    );

    // Check to see if the Shader Processing failed. If so, return null as a failure flag.
    if (!shaderMetrics) {
      console.warn(
        "The shader processor did not produce metrics for the layer."
      );
      return false;
    }

    // Retrieve all of the attributes created as a result of layer input and module processing.
    const { vertexAttributes, instanceAttributes, uniforms } = shaderMetrics;

    // Generate the geometry this layer will be utilizing
    const geometry = generateLayerGeometry(
      this,
      shaderMetrics.maxInstancesPerBuffer,
      vertexAttributes,
      shaderIO.vertexCount
    );
    // This is the material that is generated for the layer that utilizes all of the generated and
    // Injected shader IO and shader fragments
    const material = generateLayerMaterial(
      this,
      shaderMetrics.vs,
      shaderMetrics.fs,
      uniforms,
      shaderMetrics.materialUniforms
    );
    // And now we can now generate the mesh that will be added to the scene
    const model = generateLayerModel(geometry, material, shaderIO.drawMode);

    // Now that all of the elements of the layer are complete, let us apply them to the layer
    this.geometry = geometry;
    this.instanceAttributes = instanceAttributes;
    this.instanceVertexCount = shaderIO.vertexCount;
    this.material = material;
    this.maxInstancesPerBuffer = shaderMetrics.maxInstancesPerBuffer;
    this.model = model;
    this.uniforms = uniforms;
    this.vertexAttributes = vertexAttributes;

    // Generate the correct buffering strategy for the layer
    makeLayerBufferManager(this.surface.gl, this, this.scene);

    if (this.props.printShader) {
      console.warn(
        "A Layer requested its shader be debugged. Do not leave this active for production:",
        "Layer:",
        this.props.key,
        "Shader Metrics",
        shaderMetrics
      );
      console.warn("\n\nVERTEX SHADER\n--------------\n\n", shaderMetrics.vs);
      console.warn("\n\nFRAGMENT SHADER\n--------------\n\n", shaderMetrics.fs);
    }

    return true;
  }

  /**
   * This establishes basic modules required by the layer for the shaders. At it's core functionality, it will
   * support the basic properties a layer has to provide, such as Picking modes
   */
  baseShaderModules(
    shaderIO: IShaderInitialization<T>
  ): { fs: string[]; vs: string[] } {
    const additionalImportsVS = [];
    const additionalImportsFS = [];

    // All layers need the basic instancing functionality
    additionalImportsVS.push("instancing");

    // See if the layer needs picking modules
    if (this.picking.type === PickType.SINGLE) {
      additionalImportsVS.push("picking");
      additionalImportsFS.push("picking");
    } else {
      additionalImportsVS.push("no-picking");
      additionalImportsFS.push("no-picking");
    }

    // See if there are any attributes that have  auto easing involved
    const easing = (shaderIO.instanceAttributes || []).find(check =>
      Boolean(check && check.easing)
    );

    // If easing is involved then we need to make sure that frame metrics are imported for our animations
    if (easing) {
      additionalImportsVS.push("frame");
    }

    return {
      fs: additionalImportsFS,
      vs: additionalImportsVS
    };
  }

  /**
   * This provides a means for a layer to have child layers that are injected immediately after this layer.
   *
   * This essentially lets composite layer management occur allowing the compositer to behave as a layer does
   * but have layers managed by it. This has the advantage of allowing a composition layer able to handle a
   * data provider but split it's processing across it's own internal data providers which is thus picked up
   * by it's child layers and output by the layers.
   */
  childLayers(): LayerInitializer[] {
    return [];
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

  /**
   * Lifecycle method for layers to inherit that executes after the props for the layer have been updated
   */
  didUpdateProps() {
    /** LIFECYCLE */
  }

  /**
   * This is where global uniforms should update their values. Executes every frame.
   */
  draw() {
    // Consume the diffs for the instances to update each element
    const changeList = this.props.data.changeList;
    // Set needsViewDrawn to be true if there is any change
    if (changeList.length > 0) this.needsViewDrawn = true;
    // Make some holder variables to prevent declaration within the loop
    let change, instance, bufferLocations;
    // Fast ref to the processor and manager
    const diffManager = this.diffManager;
    const processing = diffManager.processing;
    const processor = diffManager.processor;

    // Forewarn the processor how many instances are flagged for a change.
    processor.incomingChangeList(changeList);
    // Forewarn the buffer manager of changes so it can optimize it's handling of changes as well
    this.bufferManager.incomingChangeList(changeList);

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
    // Tell the manager changes are processed to allow it to free up resources
    this.bufferManager.changesProcessed();
    // Flag the changes as resolved
    this.props.data.resolve(this.id);
    // Trigger uniform updates
    this.updateUniforms();
  }

  /**
   * This retrieves the observable IDs for instance observable properties. This triggers a
   * getter of the indicated property.
   *
   * Do NOT use this in intensive loops, try to cache these results where possible.
   */
  getInstanceObservableIds<K extends keyof T>(
    instance: T,
    properties: Extract<K, string>[]
  ): { [key: string]: number } {
    const out: { [key: string]: number } = {};

    // Loop through all of the requested properties to see if they are observable and have
    // an id associated with them.
    for (let i = 0, iMax = properties.length; i < iMax; ++i) {
      // Activate monitoring of ids, this also resets the monitor's list
      ObservableMonitoring.setObservableMonitor(true);
      // Trigger the getter of the property
      instance[properties[i]];
      // We now can see if the property triggered an identifier thus indicating it's observable
      // and has an ID
      const propertyIds = ObservableMonitoring.getObservableMonitorIds(true);

      // If an id is found, then the property was observable.
      if (propertyIds[0] !== undefined) {
        out[properties[i]] = propertyIds[0];
      }
    }

    // SUPER IMPORTANT to deactivate this here. Leaving this turned on causes memory to be chewed up
    // for every property getter.
    ObservableMonitoring.setObservableMonitor(false);

    return out;
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
   * The options for a three material without uniforms.
   */
  getMaterialOptions(): ILayerMaterialOptions {
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
   *
   * NOTE: Return null to indicate this layer is not going to render anything. This is typical for parent
   * layers that manage child layers who themselves do not cause rendering of any sort.
   */
  initShader(): IShaderInitialization<T> | null {
    return {
      fs: "${import: no-op}",
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      vertexCount: 0,
      vs: "${import: no-op}"
    };
  }

  /**
   * Indicates if this layer is managing an instance or not. This is normally done by determining
   * if this layer's buffer manager has assigned buffer space to the instance. In special layer cases
   * this may be overridden here to make the assertion in some other way.
   */
  managesInstance(instance: T): boolean {
    return this.bufferManager && this.bufferManager.managesInstance(instance);
  }

  /**
   * This tells the framework to rebuild the layer from scratch, thus reconstructing the shaders and geometries
   * of the layer.
   */
  rebuildLayer() {
    this.willRebuildLayer = true;

    // Children will be rebuilt as well
    if (this.children) {
      for (let i = 0, iMax = this.children.length; i < iMax; ++i) {
        const child = this.children[i];
        child.rebuildLayer();
      }
    }
  }

  /**
   * Retrieves the changes from the data provider and resolves the provider. This should be
   * used by sub Layer classes that wish to create their own custom draw handlers.
   *
   * Set preserverProvider to true to let the system know the provider's changes are still
   * required.
   */
  resolveChanges(preserveProvider?: boolean) {
    // Consume the diffs for the instances to update each element
    const changeList = this.props.data.changeList;
    // Set needsViewDrawn to be true if there is any change
    if (changeList.length > 0) this.needsViewDrawn = true;

    // See if we should make the provider not consume it's changes yet
    if (!preserveProvider) {
      // Resolve the changes from the provider so it can start collecting
      // a new list of changes to apply
      this.props.data.resolve(this.id);
    }

    // Clear the changes from all instances to be ready for next frame
    for (let i = 0, iMax = changeList.length; i < iMax; ++i) {
      changeList[i][0].changes = {};
    }

    // Return the list of changes so the changes can be handled in some fashion
    return changeList;
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

  /**
   * This method returns a flag indicating whether or not the layer should trigger it's view to redraw.
   * By default, a redraw is triggered (this returns true) when a shallow comparison of the current props
   * and the incoming props are different.
   * This method can be overridden to place custom logic at this point to indicate when redraws should happen.
   *
   * NOTE: This should be considered for redraw logic centered around changes in the layer itself.
   * There ARE additional triggers in the system that causes redraws. This method just aids in ensuring
   * necessary redraws take place for layer level logic and props.
   */
  shouldDrawView(oldProps: U, newProps: U) {
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) return true;
    }

    return false;
  }

  /**
   * This triggers the layer to update the material uniforms that have been created for the layer.
   * This is primarily used internally.
   */
  updateUniforms() {
    let uniform: IUniformInternal;
    let value: UniformIOValue;

    // Loop through the uniforms that are across all instances
    for (let i = 0, end = this.uniforms.length; i < end; ++i) {
      uniform = this.uniforms[i];
      value = uniform.update(uniform);
      uniform.materialUniforms.forEach(
        materialUniform => (materialUniform.value = value)
      );
    }
  }

  willUpdateInstances(_changes: [T, InstanceDiffType]) {
    // HOOK: Simple hook so a class can review all of it's changed instances before
    //       Getting applied to the Shader IO
  }

  /**
   * Lifecycle: Fires before the props object is updated with the newProps. Allows layer to
   * respond to diff changes.
   */
  willUpdateProps(newProps: ILayerProps<T>) {
    // Pick type changes needs to trigger layer rebuilds currently for how color picking is handled.
    if (newProps.picking !== this.props.picking) {
      this.rebuildLayer();
    }
  }
}
