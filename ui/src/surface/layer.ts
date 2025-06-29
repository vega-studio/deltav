import Debug from "debug";

import { GLSettings } from "../gl/index.js";
import { WebGLStat } from "../gl/webgl-stat.js";
import { Instance, ObservableMonitoring } from "../instance-provider/index.js";
import { DEFAULT_RESOURCE_ROUTER, ResourceRouter } from "../resources/index.js";
import PickingFS from "../shaders/base-modules/shader-fragments/picking.fs";
import { ShaderDeclarationStatementLookup } from "../shaders/index.js";
import {
  IShaderProcessingResults,
  ShaderProcessor,
} from "../shaders/processing/shader-processor.js";
import {
  FragmentOutputType,
  type IIndexBufferInternal,
  IInstanceAttribute,
  IInstanceProvider,
  IInstancingUniform,
  ILayerEasingManager,
  ILayerMaterialOptions,
  ILayerRef,
  INonePickingMetrics,
  InstanceAttributeSize,
  instanceAttributeSizeFloatCount,
  IPickInfo,
  IShaderInitialization,
  type IShaderInputInstancing,
  ISinglePickingMetrics,
  isString,
  IUniformInternal,
  IVertexAttribute,
  IVertexAttributeInternal,
  LayerBufferType,
  OutputFragmentShader,
  type OutputFragmentShaderSource,
  PickType,
  StreamChangeStrategy,
  UniformIOValue,
} from "../types.js";
import { isBoolean } from "../types.js";
import { isDefined } from "../util/common-filters.js";
import { mapInjectDefault } from "../util/common-operations.js";
import { createAttribute } from "../util/create-attribute.js";
import { onFrame } from "../util/frame.js";
import {
  IdentifyByKey,
  IdentifyByKeyOptions,
} from "../util/identify-by-key.js";
import { PromiseResolver } from "../util/promise-resolver.js";
import { uid } from "../util/uid.js";
import {
  BufferManagerBase,
  IBufferLocation,
} from "./buffer-management/buffer-manager-base.js";
import {
  InstanceAttributeBufferManager,
  InstanceAttributePackingBufferManager,
  UniformBufferManager,
} from "./buffer-management/index.js";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager.js";
import { VertexAttributeBufferManager } from "./buffer-management/vertex-attribute-buffering/vertex-attribute-buffer-manager.js";
import { VertexAttributePackingBufferManager } from "./buffer-management/vertex-attribute-packing-buffering/vertex-attribute-packing-buffer-manager.js";
import { LayerInteractionHandler } from "./layer-interaction-handler.js";
import { generateLayerGeometry } from "./layer-processing/index.js";
import { LayerScene } from "./layer-scene.js";
import { Surface } from "./surface.js";
import { IViewProps, View } from "./view.js";

const debug = Debug("performance");

/**
 * A type to describe the constructor of a Layer class.
 */
export interface ILayerConstructable<
  TInstance extends Instance,
  TLayerProps extends ILayerProps<TInstance>,
> {
  new (
    surface: Surface,
    scene: LayerScene,
    props: TLayerProps
  ): Layer<TInstance, TLayerProps>;
}

/**
 * This specifies a class type that can be used in creating a layer with
 * createLayer
 */
export type ILayerConstructionClass<
  TInstance extends Instance,
  TLayerProps extends ILayerProps<TInstance>,
> = ILayerConstructable<TInstance, TLayerProps> & { defaultProps: TLayerProps };

/**
 * This is a pair of a Class Type and the props to be applied to that class
 * type.
 */
export type LayerInitializer<
  TInstance extends Instance,
  TLayerProps extends ILayerProps<TInstance>,
> = {
  key: string;
  init: [ILayerConstructionClass<TInstance, TLayerProps>, TLayerProps];
};

/**
 * The internal system layer initializer that hides additional properties the
 * front facing API should not be concerned with.
 */
export type LayerInitializerInternal = {
  key: string;
  init: [
    ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>,
    ILayerPropsInternal<Instance>,
  ];
};

/**
 * Constructor options when generating a layer.
 */
export interface ILayerProps<TInstance extends Instance>
  extends IdentifyByKeyOptions {
  /**
   * This allows for external overriding of the base shader modules for a layer.
   * This can cause a layer to break if the overrides do not provide what the
   * layer is expecting at the least.
   */
  baseShaderModules?(
    shaderIO: IShaderInitialization<TInstance>,
    layerModules: { fs: string[]; vs: string[] }
  ): { fs: string[]; vs: string[] };
  /**
   * This is the data provider where the instancing data is injected and
   * modified.
   */
  data: IInstanceProvider<TInstance>;
  /**
   * This allows you to remap a layer's fragment output to an output your system
   * needs. For example: a layer may output a color to the glow buffer, but we
   * need that information in a different destination view output:
   *
   * [FragmentOutput.GLOW]: FragmentOutput.COLOR
   *
   * Or we can use this to just disable a layer's output to a buffer:
   *
   * [FragmentOutput.GLOW]: FragmentOutput.NONE
   *
   * You should be careful to not accidentally map an output to the same output
   * name the layer may already have in place.
   */
  mapOutput?: Record<number, number>;
  /**
   * Any pipeline declaring a layer cn manipulate a layer's default material
   * settings as every pipeline can have some specific and significant needs the
   * layer does not provide as a default.
   */
  materialOptions?: ILayerMaterialOptions;
  /**
   * This sets how instances can be picked via the mouse. This activates the
   * mouse events for the layer IFF the value is not NONE.
   */
  picking?: PickType;
  /**
   * Used for debugging. Logs the generated shader for the layer in the console.
   */
  printShader?: boolean;
  /**
   * This allows an easing ref to be applied to the layer. This ref can be used
   * for detailed information regarding easing values, which allows for easier
   * management of timings and feedback for animations being piped to the GPU.
   */
  ref?: ILayerRef;
  /**
   * This is a property that allows for changes to stream in batches instead of
   * commit in one giant push. This helps if you have 100's of 1000's of
   * instances you need to update. Updating all the instances can put extreme
   * pressure on your RAM and can cause massive frame lag. Picking a streaming
   * strategy and amount to commit per frame can greatly improve user experience
   * and can even help to prevent crashes from RAM over use.
   *
   * WARNING: Once changes start committing for a batch of changes, future
   * changes will NOT be rendered or able to affect the GPU state UNTIL the
   * streaming completes. Once the stream is completed, all edits that happen
   * subsequently will begin streaming in as the next batch of changes.
   *
   * You are allowed to change the instance's properties while waiting for a set
   * of changes to finish streaming.
   */
  streamChanges?: {
    /**
     * This is the amount of instance updates that can stream through per frame.
     * This defaults to 10000 if not provided
     */
    count?: number;
    /**
     * This is the strategy for pulling the next set of instances to update to
     * the GPU. Defaults to LINEAR
     */
    strategy?: StreamChangeStrategy;
  };

  /**
   * This allows for some passthrough controls of the instancing strategy a
   * layer will take. The layer can define it's own default instancing strategy
   * while this allows for some specialization control.
   *
   * This is used AS A SUGGESTION. A layer is NOT REQUIRED to implement
   * compatibility with this property.
   */
  bufferManagement?: IShaderInputInstancing & {
    /**
     * This can be provided to control some inner optimization strategies
     */
    optimize?: {
      /**
       * When this is enabled, the backing buffers for attributes will be
       * doubled as instances are added instead of tightly packing the buffer to
       * the instance count + base growth rate. This can reduce hefty
       * allocations and buffering copying significantly if you have a very
       * dynamic scene with a highly variable unknown number of instances.
       */
      bufferDoubling?: boolean;
      /**
       * This can be provided as a hint for the expected number of instances the
       * layer may be needing to support. This won't limit the layer to the
       * specified amount, but will definitely reduce the number of allocations
       * that have to happen.
       */
      expectedInstanceCount?: number;
    };
  };

  /**
   * If you have an understanding about the layer in use, you can provide
   * fragment output overrides or additions to the layer's fragment shader. If
   * you specify an output type that already exists, this provided source will
   * override the existing source.
   */
  fs?: OutputFragmentShaderSource;

  // ---- EVENTS ----
  /**
   * Executes when the mouse is down on instances (Picking type must be set)
   */
  onMouseDown?(info: IPickInfo<TInstance>): void;
  /** Executes when the mouse moves on instances (Picking type must be set) */
  onMouseMove?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when the mouse no longer over instances (Picking type must be set)
   */
  onMouseOut?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when the mouse is newly over instances (Picking type must be set)
   */
  onMouseOver?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when the mouse button is released when over instances (Picking
   * type must be set)
   */
  onMouseUp?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when the mouse was down on an instance but is released up outside
   * of that instance (Picking type must be set)
   */
  onMouseUpOutside?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when the mouse click gesture is executed over instances (Picking
   * type must be set)
   */
  onMouseClick?(info: IPickInfo<TInstance>): void;

  /**
   * Executes when there are no longer any touches that are down for the layer
   * (Picking type must be set).
   *
   * NOTE: This executes for touches being released inside and outside their
   * respective instance.
   */
  onTouchAllEnd?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch is down on instances. Each touch will produce it's
   * own event (Picking type must be set)
   */
  onTouchDown?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch is up when over on instances. Each touch will produce
   * it's own event (Picking type must be set)
   */
  onTouchUp?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch was down on an instance but is released up outside of
   * that instance (Picking type must be set)
   */
  onTouchUpOutside?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch is moving atop of instances. Each touch will produce
   * it's own event (Picking type must be set)
   */
  onTouchMove?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch is moves off of an instance. Each touch will produce
   * it's own event (Picking type must be set)
   */
  onTouchOut?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch moves over instances while the touch is dragged
   * around the screen. (Picking type must be set)
   */
  onTouchOver?(info: IPickInfo<TInstance>): void;
  /**
   * Executes when a touch moves off of an instance and there is no longer ANY
   * touches over the instance (Picking type must be set)
   */
  onTouchAllOut?(info: IPickInfo<TInstance>): void;
  /** Executes when a touch taps on instances. (Picking type must be set) */
  onTap?(info: IPickInfo<TInstance>): void;
}

/**
 * Layer properties that contains internal system values
 */
export interface ILayerPropsInternal<T extends Instance>
  extends ILayerProps<T> {
  /**
   * The system provides this for the layer when the layer is being produced as
   * a child of another layer
   */
  parent?: Layer<Instance, ILayerProps<Instance>>;
}

/**
 * This is the information a layer stores regarding its shader configuration
 * information
 */
export interface ILayerShaderIOInfo<T extends Instance> {
  /** This is the attribute that specifies the _active flag for an instance */
  activeAttribute: IInstanceAttribute<T>;
  /** This is the excess buffer growth rate for buffers for the layer. */
  baseBufferGrowthRate: number;
  /**
   * These are the fragment shaders associated with each View that is available.
   */
  fs: OutputFragmentShader;
  /** Indicates if this layer is using instanced backed buffers */
  instancing: boolean;
  /** This is all of the instance attributes generated for the layer */
  instanceAttributes: IInstanceAttribute<T>[];
  /** Provides the number of vertices a single instance spans */
  instanceVertexCount: number;
  /**
   * INTERNAL: For the given shader IO provided this is how many instances can
   * be present per buffer.
   */
  maxInstancesPerBuffer: number;
  /**
   * Default model configuration for rendering in the gl layer. Since there is a
   * material per view, it goes to follow that there is a model per view.
   */
  drawMode: GLSettings.Model.DrawMode;
  /** This is all of the uniforms generated for the layer */
  uniforms: IUniformInternal[];
  /** Uniforms generated or discovered during shader processing. */
  materialUniforms: IInstancingUniform[];
  /** This is all of the vertex attributes generated for the layer */
  vertexAttributes: IVertexAttributeInternal[];
  /** This is the vertex buffer generated for the layer */
  indexBuffer?: IIndexBufferInternal;
  /**
   * This is the vertex shader this layer has produced for processing it's
   * geometry.
   */
  vs: string;
}

interface ILayerEasingManagerInternal extends ILayerEasingManager {
  easingComplete: PromiseResolver<void>;
}

/**
 * A base class for generating drawable content
 */
export class Layer<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
> extends IdentifyByKey {
  /**
   * This MUST be implemented by sublayers in order for proper code hinting to
   * happen
   */
  static defaultProps: any = {};

  /**
   * Calculated end time of all animations that will take place. This will cause
   * the system to keep rendering and not go into an idle state until the time
   * of the last rendered frame has exceeded the time flagged here.
   */
  animationEndTime = 0;
  /**
   * This is a flag that allows a system to indicate this layer should always
   * re-render
   */
  alwaysDraw = false;
  /** Buffer manager is read only. Must use setBufferManager */
  private _bufferManager!: BufferManagerBase<
    TInstance,
    TProps,
    IBufferLocation
  >;
  /**
   * This matches an instance to the data buffers and positions to stream to the
   * GPU for direct updates. Use setBufferManager to change this element.
   */
  get bufferManager() {
    return this._bufferManager;
  }
  /** Buffer type is private and should not be directly modified */
  private _bufferType?: LayerBufferType;
  /** This is the determined buffering strategy of the layer */
  get bufferType() {
    return this._bufferType || LayerBufferType.INSTANCE_ATTRIBUTE;
  }
  /** When a layer creates children, this is populated with those children */
  children?: Layer<Instance, ILayerProps<Instance>>[];
  /** This determines the drawing order of the layer within it's scene */
  depth = 0;
  /** This contains the methods and controls for handling diffs for the layer */
  diffManager?: InstanceDiffManager<TInstance, TProps>;
  /**
   * This gets populated when there are attributes that have easing applied to
   * them. This subsequently gets applied to instances when they get added to
   * the layer.
   */
  easingId?: { [key: string]: number };
  /**
   * This is a manager used to monitor and handle the easing operations of the
   * layer
   */
  private _easingManager: ILayerEasingManagerInternal = {
    easingComplete: new PromiseResolver(),
    complete: () => this._easingManager.easingComplete.promise,
  };

  get easingManager(): ILayerEasingManager {
    return this._easingManager;
  }

  /** This is the initializer used when making this layer. */
  initializer!: LayerInitializer<TInstance, TProps>;
  /** This is the handler that manages interactions for the layer */
  interactions?: LayerInteractionHandler<TInstance, TProps>;
  /** The last time stamp this layer had its contents rendered */
  lastFrameTime = 0;
  /** This indicates whether this layer needs to draw */
  needsViewDrawn = false;
  /** Helps assert rendering order. Lower numbers render first. */
  order?: number;
  /**
   * If this is populated, then this layer is the product of a parent producing
   * this layer.
   */
  parent?: Layer<Instance, ILayerProps<Instance>>;
  /** This is all of the picking metrics kept for handling picking scenarios */
  picking: ISinglePickingMetrics<TInstance> | INonePickingMetrics = {
    currentPickMode: PickType.NONE,
    type: PickType.SINGLE,
    uidToInstance: new Map<number, TInstance>(),
  };
  /** Properties handed to the Layer during a Surface render */
  props: TProps;
  /**
   * This is the system provided resource manager that lets a layer request
   * resources
   */
  resource: ResourceRouter = DEFAULT_RESOURCE_ROUTER;
  /** This is the layer scene this layer feeds into */
  scene: LayerScene;
  /**
   * This contains the shader IO information generated when the layer was
   * created
   */
  shaderIOInfo: ILayerShaderIOInfo<TInstance> =
    {} as ILayerShaderIOInfo<TInstance>;
  /**
   * This is populated with the current streaming state for committing changes
   * to the GPU. See ILayerProps for how the configuration happens for this
   * object.
   */
  private streamChanges: {
    /**
     * When locked this layer will NOT stream in new changes as it has a current
     * stream it is completing first.
     */
    locked: boolean;
    /**
     * When defined, this is the list of items currently being streamed to the
     * GPU.
     */
    stream?: TProps["data"]["changeList"];
    /** The index our stream has iterated through for the current stream */
    streamIndex: number;
  } = {
    locked: false,
    streamIndex: 0,
  };
  /** This is the surface this layer is generated under */
  surface: Surface;

  /** A uid provided to the layer to give it some uniqueness as an object */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();
  /**
   * This maps a uid to the instance. This is only populated if it's needed for
   * the processes the layer uses (such as color picking).
   */
  uidToInstance = new Map<number, TInstance>();
  /**
   * This is the view the layer is applied to. This changes as the rendering
   * progresses. A configuration of the surface can specify several views for a
   * set of layers. So, this will change with the current view being rendered
   * during a draw pass.
   *
   * NOTE: The system sets this, modifying it yourself will only cause sorrow.
   */
  view!: View<IViewProps>;
  /**
   * This flag indicates if the layer will be reconstructed from scratch next
   * layer rendering cycle
   */
  willRebuildLayer = false;

  /**
   * This is a hook for the layer to respond to an instance being added via the
   * diff manager. This is a simple opportunity to set some expectations of the
   * instance and tie it directly to the layer it is processing under.
   *
   * By default for best performance, this method is undefined for the layer.
   * One must be applied for the hook to take effect.
   *
   * For example: the primary case this arose was from instances needing the
   * easing id mapping to allow for retrieval of the instance's easing
   * information for a given layer association.
   *
   * WARNING: This is tied into a MAJOR performance sensitive portion of the
   * framework. This should involve VERY simple assignments at best. Do NOT
   * perform any logic in this callback or your application WILL suffer.
   */
  onDiffAdd?(instance: TInstance): void;

  /**
   * This is an opportunity to clean up any instance's association with the
   * layer it was originally a part of.
   *
   * WARNING: This is tied into a MAJOR performance sensitive portion of the
   * framework. This should involve VERY simple assignments at best. Do NOT
   * perform any logic in this callback or your application WILL suffer.
   *
   * EXTRA WARNING: You better make sure you instantiate this if you
   * instantiated onDiffManagerAdd so you can clean out any bad memory
   * allocation choices you made.
   */
  onDiffRemove?(instance: TInstance): void;

  /**
   * Generates a reference object that can be used to retrieve layer specific
   * metrics associated with the layer.
   */
  static createRef<T extends ILayerRef>(): T {
    return {
      easing: null,
    } as T;
  }

  constructor(surface: Surface, scene: LayerScene, props: TProps) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(props);
    // Keep track of the surface this layer resides beneath
    this.surface = surface;
    // Track the parent Layer Scene this layer is under
    this.scene = scene;
    // Keep our props within the layer
    this.props = Object.assign({}, Layer.defaultProps || {}, props as TProps);
  }

  /**
   * Validates the shader initialization object from the layer.
   */
  private validateShaderIO(shaderIO: IShaderInitialization<TInstance> | null) {
    // If no metrics are provided, this layer is merely a shell layer and will
    // not receive any GPU handling objects.
    if (!shaderIO) {
      if (this.picking) {
        this.picking.type = PickType.NONE;
      }

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

    return;
  }

  /**
   * Performs clean ups on the data provided by the layer for the Shader
   * Initialization to make it easier and more reliable to work with when
   * processing.
   */
  private cleanShaderIOElements(shaderIO: IShaderInitialization<TInstance>) {
    // Clean out nulls provided as a convenience to the layer
    shaderIO.instanceAttributes = (shaderIO.instanceAttributes || []).filter(
      isDefined
    );
    shaderIO.vertexAttributes = (shaderIO.vertexAttributes || []).filter(
      isDefined
    );
    shaderIO.uniforms = (shaderIO.uniforms || []).filter(isDefined);
  }

  /**
   * When the layer declares it's shader intiialization, it can specify multiple
   * fragment shader fragments each with their own output target type. We do NOT
   * allow two fragments to point to the same type. This performs a thorough
   * check to ensure that does not happen.
   */
  private checkForDuplicateOutputTypes(
    shaderIO: IShaderInitialization<TInstance>
  ) {
    let { mapOutput } = this.props;

    // If the fragment is just a string, then it's output source is the default
    // COLOR target.
    if (isString(shaderIO.fs)) {
      shaderIO.fs = [
        {
          outputType: FragmentOutputType.COLOR,
          source: shaderIO.fs,
        },
      ];
    }

    // Use the layer's output mapping to transform the target outputs of the
    // fragment shader
    mapOutput = mapOutput || {};
    const outputTypeCheck = new Set<number>();
    let hasDuplicateType = false;
    let nothingTarget = Number.MIN_SAFE_INTEGER;

    // Perform fragment output mapping changes AND check for duplicate output
    // targets which will be considered invalid.
    for (let i = 0, iMax = shaderIO.fs.length; i < iMax; ++i) {
      const output = shaderIO.fs[i];
      const newOutput = mapOutput[output.outputType];

      if (newOutput === void 0) {
        if (outputTypeCheck.has(output.outputType)) {
          hasDuplicateType = true;
        }

        outputTypeCheck.add(output.outputType);
        continue;
      }

      // When mapped to nothing, we can not remove the fragment as it may be a
      // requirement for later fragments, so we just map it's type to a
      // non-sensical number.
      if (newOutput === FragmentOutputType.NONE) {
        output.outputType = nothingTarget++;
      } else {
        output.outputType = newOutput;
      }

      if (outputTypeCheck.has(output.outputType)) {
        hasDuplicateType = true;
      }

      outputTypeCheck.add(output.outputType);
    }

    if (hasDuplicateType) {
      console.warn("Layer has duplicate fragment shader output types");
      return false;
    }

    return;
  }

  /**
   * Processes the fragment outputs a layer provides against each view and
   * generates a merged fragment shader with those fragments optimized for each
   * view.
   */
  private processFragmentShadersForEachView(
    shaderIO: IShaderInitialization<TInstance>,
    views: View<IViewProps>[]
  ) {
    // If the fragment is just a string, then it's output source is the default
    // COLOR target. This also simplifies our data type to guarantee a list.
    if (isString(shaderIO.fs)) {
      shaderIO.fs = [
        {
          outputType: FragmentOutputType.COLOR,
          source: shaderIO.fs,
        },
      ];
    }

    const propsFS = this.props.fs;

    if (propsFS) {
      if (isString(propsFS)) {
        const fsSource = propsFS;
        shaderIO.fs.map((fs) => {
          if (fs.outputType === FragmentOutputType.COLOR) {
            fs.source = fsSource;
          }

          return fs;
        });
      } else {
        for (let i = 0, iMax = propsFS.length; i < iMax; ++i) {
          const { outputType, source } = propsFS[i];
          const index = shaderIO.fs.findIndex(
            (layerOutput) => layerOutput.outputType === outputType
          );

          if (index > -1) {
            shaderIO.fs[index] = { outputType, source };
          } else {
            shaderIO.fs.push({ outputType, source });
          }
        }
      }
    }

    // We inject automated picking items if the user has not defined their own
    // picking output type.
    const doAutomatedPicking =
      this.picking.type === PickType.SINGLE &&
      !shaderIO.fs.find(
        (output) => output.outputType === FragmentOutputType.PICKING
      );

    if (this.picking.type === PickType.SINGLE && !doAutomatedPicking) {
      throw new Error(
        "Do NOT specify picking prop on a layer when you have your own Picking output declared."
      );
    }

    const pickingFragmentOutput = {
      outputType: FragmentOutputType.PICKING,
      source: PickingFS,
    };

    // We will store each fragment shader created per view
    const outputFragmentShaders: OutputFragmentShader = new Map();
    // Any of our processes from here on out can require and generate
    // declarations that need to go into the application. This provides a means
    // of passing those declarations to the shader processor when it builds the
    // headers of our shader files.
    const declarations: ShaderDeclarationStatementLookup = {
      fs: new Map(),
      vs: new Map(),
      destructure: new Map(),
    };

    // We must analyze our fragment shaders and views to determine which
    // processing output we are going to actually output for the sake of the
    // view. Each view that declares a unique output for the layer requires it's
    // own shader or group of shaders.
    for (let i = 0, iMax = views.length; i < iMax; ++i) {
      const view = views[i];

      // Delete previously existing picking fragment output so it can be
      // injected in the correct location.
      if (doAutomatedPicking) {
        const index = shaderIO.fs.findIndex(
          (layerOutput) => layerOutput.outputType === FragmentOutputType.PICKING
        );

        if (index > -1) {
          shaderIO.fs.splice(index, 1);
        }
      }

      // See which fragment output is the LAST needed output in the list
      const viewOutputTargets = view.getOutputTargets();
      let maxLayerOutputIndex = 0;
      shaderIO.fs.forEach((layerOutput, i) => {
        if (
          viewOutputTargets?.find(
            (viewTarget) => viewTarget.outputType === layerOutput.outputType
          )
        ) {
          maxLayerOutputIndex = i;
        }
      });

      // If Picking is enabled, we force inject a picking target for the
      // fragement shader AFTER the last major output index so we don't
      // accidentally cause needless fragment shader outputs to get bundled in.
      if (doAutomatedPicking) {
        shaderIO.fs.splice(maxLayerOutputIndex + 1, 0, pickingFragmentOutput);
      }

      let declarationsFS = mapInjectDefault(declarations.fs, view, new Map());

      if (!declarationsFS) {
        declarationsFS = new Map();
        declarations.fs.set(view, declarationsFS);
      }

      // This processes the fragment shader's fragments written for the layer
      // and combines all of the fragments that matches with the current view's
      // output target types.
      const outputFragmentShader = ShaderProcessor.makeOutputFragmentShader(
        declarations.vs,
        declarationsFS,
        viewOutputTargets,
        shaderIO.fs
      );

      if (!outputFragmentShader) {
        continue;
      }

      // Store the output fragment shaders for the given view
      outputFragmentShaders.set(view, outputFragmentShader);
    }

    if (outputFragmentShaders.size === 0) {
      console.warn(
        "Could not generate output fragment shaders for the view specified."
      );
      return false;
    }

    return { outputFragmentShaders, declarations };
  }

  /**
   * This performs the actual generation of the vertex and fragment shaders this
   * layer will use. Each fragment shader is now associated with it's respective
   * view and will be generated accordingly.
   */
  private processLayerShaders(
    shaderIO: IShaderInitialization<TInstance>,
    outputFragmentShaders: OutputFragmentShader,
    declarations: ShaderDeclarationStatementLookup
  ) {
    let shaderMetrics:
      | (Omit<IShaderProcessingResults<TInstance>, "fs"> & {
          fs: OutputFragmentShader;
        })
      | null = null;

    // Generate the actual shaders to be used by injecting all of the
    // necessary fragments from all modules
    shaderMetrics = new ShaderProcessor().process(
      this,
      shaderIO,
      outputFragmentShaders,
      declarations,
      this.surface.getIOExpanders(),
      this.surface.getShaderTransforms(),
      this.surface.getIOSorting()
    );

    // Check to see if the Shader Processing failed. If so, return null as a
    // failure flag.
    if (!shaderMetrics) {
      console.warn(
        "The shader processor did not produce metrics for the layer."
      );
      return false;
    }

    // Now that all of the elements of the layer are complete, let us apply them
    // to the layer
    this.shaderIOInfo = Object.assign<
      ILayerShaderIOInfo<TInstance>,
      ILayerShaderIOInfo<TInstance>
    >(
      {
        // This is a filler active attribute. It gets replaced.
        activeAttribute: createAttribute({
          name: "active",
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.active ? 1 : 0],
        }),
        baseBufferGrowthRate:
          shaderIO.baseBufferGrowthRate === void 0
            ? 1000
            : shaderIO.baseBufferGrowthRate,
        instancing: shaderIO.instancing === void 0 ? true : shaderIO.instancing,
        instanceAttributes: shaderMetrics.instanceAttributes,
        instanceVertexCount: shaderIO.vertexCount,
        vs: shaderMetrics.vs,
        fs: shaderMetrics.fs,
        materialUniforms: shaderMetrics.materialUniforms,
        maxInstancesPerBuffer: shaderMetrics.maxInstancesPerBuffer,
        drawMode: shaderIO.drawMode || GLSettings.Model.DrawMode.TRIANGLE_STRIP,
        uniforms: shaderMetrics.uniforms,
        vertexAttributes: shaderMetrics.vertexAttributes,
        indexBuffer: shaderMetrics.indexBuffer,
      },
      this.shaderIOInfo
    );

    return;
  }

  /**
   * Processes the static vertex information and applies GL Attributes for each
   * item.
   */
  private processVertexAttributes(shaderIO: IShaderInitialization<TInstance>) {
    generateLayerGeometry(
      this,
      this.shaderIOInfo.maxInstancesPerBuffer,
      this.shaderIOInfo.vertexAttributes,
      shaderIO.vertexCount,
      this.shaderIOInfo.indexBuffer
    );
  }

  /**
   * This does special initialization by gathering the layers shader IO,
   * generates a material and injects special automated uniforms and attributes
   * to make instancing work for the shader.
   */
  init(views: View<IViewProps>[]) {
    if (!this.surface.gl) {
      console.warn("The layer's surface does not have a valid WebGL context.");
      return false;
    }

    // Set up the pick type for the layer
    const { picking = PickType.NONE } = this.props;

    if (picking === PickType.SINGLE) {
      this.picking = {
        currentPickMode: PickType.NONE,
        type: PickType.SINGLE,
        uidToInstance: new Map<number, TInstance>(),
      };
    } else {
      this.picking = {
        currentPickMode: PickType.NONE,
        type: PickType.NONE,
      };
    }

    // Set the resource manager this surface utilizes to the layer
    this.resource = this.surface.resourceManager;
    // Get the shader metrics the layer desires
    const shaderIO: IShaderInitialization<TInstance> | null = this.initShader();
    // Ensure the layer has interaction handling applied to it
    this.interactions = new LayerInteractionHandler(this);

    // Perform validation checks and see if we need to quick exit with a layer
    // construction flag.
    const ioValidation = this.validateShaderIO(shaderIO);
    if (ioValidation !== void 0) return ioValidation;
    if (!shaderIO) return false;

    let result;

    // Perform the base raw shader transforms before anything has a chance to
    // touch them. This makes the raw transform as easy to comprehend as
    // possible and opens it up to the most features that can be had.
    const transforms = this.surface.getShaderTransforms();

    transforms.forEach((transform) => {
      shaderIO.vs = transform.rawVertex(shaderIO.vs);
      shaderIO.fs = transform.rawFragment(shaderIO.fs);
    });

    // Shader initialization can be a little sloppy which creates some
    // convenience in writing layers. This helps ensures some data types are
    // established.
    result = this.cleanShaderIOElements(shaderIO);
    if (isBoolean(result)) return result;
    // Layer fragments can not output to the same output targets.
    result = this.checkForDuplicateOutputTypes(shaderIO);
    if (isBoolean(result)) return result;
    // Our fragment shaders are
    result = this.processFragmentShadersForEachView(shaderIO, views);
    if (isBoolean(result)) return result;
    // Now take all of the information gathered and generate the actual shaders
    // this layer will need to handle all of the views and attributes used
    result = this.processLayerShaders(
      shaderIO,
      result.outputFragmentShaders,
      result.declarations
    );
    if (isBoolean(result)) return result;
    // After all processing is complete, let's initialize our vertex attributes
    // which are used in our base geometry
    result = this.processVertexAttributes(shaderIO);
    if (isBoolean(result)) return result;
    // Generate the correct buffering strategy for the layer
    result = this.makeLayerBufferManager(this.surface.gl, this.scene, shaderIO);
    if (isBoolean(result)) return result;
    // Establish diff handlers based on the settings of the layer
    result = this.updateDiffHandlers();
    if (isBoolean(result)) return result;
    // Handle debugging calls so we can print useful information about this
    // layer
    this.layerShaderDebugging();

    // Establish initial ref needs
    if (this.props.ref) {
      this.props.ref.easing = this.easingManager;
    }

    // Make sure the provider is properly synced. This will alleviate any issues
    // that arise if the provider came from another layer.
    this.props.data.sync();

    return true;
  }

  private layerShaderDebugging() {
    if (this.props.printShader) {
      console.warn(
        `Layer: ${this.props.key}`,
        "\nShader Configuration:",
        this.shaderIOInfo
      );
      console.warn("VERTEX SHADER\n");
      console.warn(`\n${this.shaderIOInfo.vs}`);

      this.shaderIOInfo.fs.forEach((fs, view) => {
        console.warn(
          `FRAGMENT SHADER:\n`,
          `view: ${view.id}):\nOutput Targets${JSON.stringify(
            fs.outputNames
          )}\n${JSON.stringify(fs.outputTypes)}\n`
        );
        console.warn(`\n${fs.source}`);
      });
    }
  }

  /**
   * This establishes basic modules required by the layer for the shaders. At
   * it's core functionality, it will support the basic properties a layer has
   * to provide, such as Picking modes
   */
  baseShaderModules(shaderIO: IShaderInitialization<TInstance>): {
    fs: string[];
    vs: string[];
  } {
    const additionalImportsVS: string[] = [];
    const additionalImportsFS: string[] = [];

    // All layers need the basic instancing functionality
    additionalImportsVS.push("instancing");

    // See if the layer needs picking modules
    if (this.picking.type === PickType.SINGLE) {
      additionalImportsVS.push("picking");
    }

    // See if there are any attributes that have  auto easing involved
    const easing = (shaderIO.instanceAttributes || []).find((check) =>
      Boolean(check && check.easing)
    );

    // If easing is involved then we need to make sure that frame metrics are
    // imported for our animations
    if (easing) {
      additionalImportsVS.push("frame");
    }

    return {
      fs: additionalImportsFS,
      vs: additionalImportsVS,
    };
  }

  /**
   * This provides a means for a layer to have child layers that are injected
   * immediately after this layer.
   *
   * This essentially lets composite layer management occur allowing the
   * compositer to behave as a layer does but have layers managed by it. This
   * has the advantage of allowing a composition layer able to handle a data
   * provider but split it's processing across it's own internal data providers
   * which is thus picked up by it's child layers and output by the layers.
   */
  childLayers(): LayerInitializer<Instance, ILayerProps<Instance>>[] {
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
   * Lifecycle method for layers to inherit that executes after the props for
   * the layer have been updated
   */
  didUpdateProps() {
    /** LIFECYCLE */
  }

  /**
   * This is where global uniforms should update their values. Executes every
   * frame.
   */
  draw() {
    // Make sure the stream lock is up to date before processing the next set of
    // changes
    this.updateStreamLock();
    // Consume the diffs for the instances to update each element
    const changeList = this.getChangeList();

    // Set needsViewDrawn to be true if there is any change
    if (changeList.length > 0) this.needsViewDrawn = true;
    // Make some holder variables to prevent declaration within the loop
    let change, instance, bufferLocations;
    // Fast ref to the processor and manager
    const diffManager = this.diffManager;
    if (!diffManager || !this.bufferManager) return;
    const processing = diffManager.processing;
    const processor = diffManager.processor;

    // Forewarn the processor how many instances are flagged for a change.
    if (!processor) {
      console.warn(
        "A layer is atttempting to draw without a diff processor for analyzing changes."
      );
      return;
    }

    processor.incomingChangeList(changeList);
    // Forewarn the buffer manager of changes so it can optimize it's handling
    // of changes as well
    this.bufferManager.incomingChangeList(changeList);

    for (let i = 0, end = changeList.length; i < end; ++i) {
      change = changeList[i];
      instance = change[0];
      bufferLocations = this.bufferManager.getBufferLocations(instance);
      // The diff type is change[1] which we use to find the diff processing
      // method to use
      processing?.[change[1]](
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
    // Update our easing management
    this.updateEasingManager();
    // Trigger uniform updates
    this.updateUniforms();
  }

  /**
   * This handles updating our easingManager so references can properly react to
   * easing completion times.
   */
  private updateEasingManager() {
    // If we're streaming changes, then we have to wait for the stream to be
    // finished before we can use the animation end time of the layer to
    // establish the true end of all animations piped to the GPU.
    if (this.props.streamChanges) {
      // Wait for the stream to be emptied so we can
      if (!this.streamChanges.stream || this.streamChanges.stream.length <= 0) {
        // Get the existing resolver that is waiting for the animations to
        // complete
        const resolver = this._easingManager.easingComplete;
        // Make a new resolver for next processes waiting for a current change
        // set to complete
        this._easingManager.easingComplete = new PromiseResolver<void>();

        // Set a timer to complete when the layer has finished it's animation
        // cycle
        onFrame(() => {
          resolver.resolve();
        }, this.animationEndTime - this.surface.frameMetrics.currentTime);
      }
    }

    // If this is a non-streamed change, then we simply wait until the layer's
    // animation timer is resolved
    else {
      // Get the existing resolver that is waiting for the animations to
      // complete
      const resolver = this._easingManager.easingComplete;
      // Make a new resolver for next processes waiting for a current change set
      // to complete
      this._easingManager.easingComplete = new PromiseResolver<void>();

      // Set a timer to complete when the layer has finished it's animation
      // cycle
      onFrame(() => {
        resolver.resolve();
      }, this.animationEndTime - this.surface.frameMetrics.currentTime);
    }
  }

  /**
   * This gets the next changes that should be retrieved from a change stream. A
   * stream is when changes are streamed in batches instead of committing all
   * changes in a single update.
   */
  private getNextStreamChanges() {
    let out: TProps["data"]["changeList"];

    // Get the stream changes settings from our props
    const {
      streamChanges = {
        count: 10000,
        strategy: StreamChangeStrategy.LINEAR,
      },
    } = this.props;
    // Get the stream that is currently in progress
    const { stream = [], streamIndex } = this.streamChanges;

    // Ensure we have a count set for the number of items to stream down
    if (streamChanges.count === void 0) {
      streamChanges.count = 10000;
    }

    // Validate the number of items to stream. Any number at 0 or less indicates
    // a desire to stream all remaining changes.
    if (streamChanges.count <= 0) {
      streamChanges.count = Number.MAX_SAFE_INTEGER;
    }

    // Pick the strategy for pulling the next changes from the stream
    switch (streamChanges.strategy) {
      // Linear just pulls out changes as they came in
      case StreamChangeStrategy.LINEAR:
      default: {
        out = stream.slice(streamIndex, streamIndex + streamChanges.count);
        this.streamChanges.streamIndex += streamChanges.count;
        break;
      }
    }

    // If we hit the end of the stream, we need to dump the stream from memory.
    if (
      this.streamChanges.stream &&
      this.streamChanges.streamIndex >= this.streamChanges.stream.length
    ) {
      delete this.streamChanges.stream;
    }

    return out;
  }

  /**
   * This checks the status of the stream and determines if this layer is locked
   * into a stream or is done processing the stream.
   */
  private updateStreamLock() {
    this.streamChanges.locked = Boolean(
      this.streamChanges.stream &&
        this.streamChanges.streamIndex < this.streamChanges.stream.length
    );
  }

  /**
   * This gets the next instance changes to push to the GPU.
   */
  private getChangeList() {
    let changeList: TProps["data"]["changeList"];

    // If we are streaming changes we do not accept new changes coming down but
    // instead work on resolving the current stream
    if (this.streamChanges.locked) {
      changeList = this.getNextStreamChanges();
    } else {
      // If streaming changes is declared for the properties of the layer, then
      // we need to gather the current change list into a stream and pull a set
      // of the changes.
      if (this.props.streamChanges) {
        // We start a new stream so we have to begin at it's start index
        this.streamChanges.streamIndex = 0;
        // We lock the layer for the streaming changes so the stream will
        // complete before new changes are applied
        this.streamChanges.locked = true;
        // Create the new stream from the existing changes.
        this.streamChanges.stream = this.props.data.changeList;
        // We provide no changes the first frame. There is some set up that can
        // cause a spike in utilization, so we don't want the first changes to
        // be too far ahead of the changes of others.
        changeList = [];
        // Since we retrieved all the current changes and applied it to our
        // stream, we resolve the changes from the provider so new changes can
        // be gathered whilst the stream resolves.
        this.props.data.resolve(this.id);
      } else {
        // This is simply full copying all current changes as the next set of
        // changes to be applied
        changeList = this.props.data.changeList;
        // Flag the changes as resolved since we gathered all changes and the
        // changes will be immediately applied
        this.props.data.resolve(this.id);
      }
    }

    this.updateStreamLock();

    return changeList;
  }

  /**
   * This retrieves the observable IDs for instance observable properties. This
   * triggers a getter of the indicated property.
   *
   * Do NOT use this in intensive loops, try to cache these results where
   * possible.
   */
  getInstanceObservableIds<K extends keyof TInstance>(
    instance: TInstance,
    properties: Extract<K, string>[]
  ): { [key: string]: number } {
    const out: { [key: string]: number } = {};

    // Loop through all of the requested properties to see if they are
    // observable and have an id associated with them.
    for (let i = 0, iMax = properties.length; i < iMax; ++i) {
      // Activate monitoring of ids, this also resets the monitor's list
      ObservableMonitoring.setObservableMonitor(true);
      // Trigger the getter of the property
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      instance[properties[i]];
      // We now can see if the property triggered an identifier thus indicating
      // it's observable and has an ID
      const propertyIds = ObservableMonitoring.getObservableMonitorIds(true);

      // If an id is found, then the property was observable.
      if (propertyIds[0] !== undefined) {
        out[properties[i]] = propertyIds[0];
      }
    }

    // SUPER IMPORTANT to deactivate this here. Leaving this turned on causes
    // memory to be chewed up for every property getter.
    ObservableMonitoring.setObservableMonitor(false);

    return out;
  }

  /**
   * The options for a GL Material without uniforms.
   */
  getMaterialOptions(): ILayerMaterialOptions {
    return {};
  }

  /**
   * This sets up all of the data bindings that will transport data from the CPU
   * to the Shader on the GPU.
   *
   * Instance Attributes: These are very frequently changing attributes
   * Vertex Attributes: These are attributes that should be static on a vertex.
   *                    Conisder it very costly to update. The only time making
   *                    these modifieable is in the event of GL_POINTS.
   * Uniforms: These set up the uniforms for the layer, thus having all normal
   *           implications of a uniform. Global across the fragment and vertex
   *           shaders and can be modified with little consequence.
   *
   * NOTE: Return null to indicate this layer is not going to render anything.
   * This is typical for parent layers that manage child layers who themselves
   * do not cause rendering of any sort.
   */
  initShader(): IShaderInitialization<TInstance> | null {
    return {
      instancing: true,
      baseBufferGrowthRate: 1000,
      fs: "${import: no-op}",
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      vertexCount: 0,
      vs: "${import: no-op}",
    };
  }

  /**
   * Indicates if this layer is managing an instance or not. This is normally
   * done by determining if this layer's buffer manager has assigned buffer
   * space to the instance. In special layer cases this may be overridden here
   * to make the assertion in some other way.
   */
  managesInstance(instance: TInstance): boolean {
    return (
      isDefined(this.bufferManager) &&
      this.bufferManager.managesInstance(instance)
    );
  }

  /**
   * This method determines the buffering strategy that the layer should be
   * utilizing based on provided vertex and instance attributes.
   */
  getLayerBufferType<T extends Instance>(
    _gl: WebGLRenderingContext,
    shaderIO: IShaderInitialization<TInstance>,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<T>[]
  ) {
    let type = LayerBufferType.UNIFORM;
    let attributesUsed = 0;

    // The layer only gets it's buffer type calculated once
    if (this._bufferType !== undefined) {
      return this._bufferType;
    }

    if (WebGLStat.HARDWARE_INSTANCING) {
      for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
        const attribute = vertexAttributes[i];
        attributesUsed += Math.ceil(attribute.size / 4);
      }

      for (let i = 0, end = instanceAttributes.length; i < end; ++i) {
        const attribute = instanceAttributes[i];
        attributesUsed += Math.ceil(
          instanceAttributeSizeFloatCount[attribute.size || 1] / 4
        );
      }

      // Too many attempted single attributes. We will next attempt to see if we
      // can pack the vertex attributes down into blocks.
      if (attributesUsed > WebGLStat.MAX_VERTEX_ATTRIBUTES) {
        attributesUsed = 0;

        for (let i = 0, end = instanceAttributes.length; i < end; ++i) {
          const attribute = instanceAttributes[i];
          attributesUsed = Math.max(attributesUsed, attribute.block || 0);
        }

        for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
          const attribute = vertexAttributes[i];
          attributesUsed += Math.ceil(attribute.size / 4);
        }

        // If we can fit now, then we are good to go with using attribute
        // packing
        if (attributesUsed < WebGLStat.MAX_VERTEX_ATTRIBUTES) {
          type =
            shaderIO.instancing === false
              ? LayerBufferType.VERTEX_ATTRIBUTE_PACKING
              : LayerBufferType.INSTANCE_ATTRIBUTE_PACKING;

          debug(
            `Performance Issue (Moderate):
            Layer %o is utilizing too many vertex attributes and is now using vertex packing.
            Max Vertex units %o
            Used Vertex units %o
            Instance Attributes %o
            Vertex Attributes %o`,
            this.id,
            WebGLStat.MAX_VERTEX_ATTRIBUTES,
            attributesUsed,
            instanceAttributes,
            vertexAttributes
          );
        }
      } else {
        // If we make it here, we are good to go using hardware instancing (when
        // enabled)! Hooray performance!
        type =
          shaderIO.instancing === false
            ? LayerBufferType.VERTEX_ATTRIBUTE
            : LayerBufferType.INSTANCE_ATTRIBUTE;
      }
    }

    // No other faster mode supported: use uniform instancing
    if (type === LayerBufferType.UNIFORM) {
      debug(
        `Performance Issue (High):
        Layer %o is utilizing too many vertex attributes and is now using a uniform buffer.
        Max Vertex units %o
        Used Vertex units %o
        Instance Attributes %o
        Vertex Attributes %o`,
        this.id,
        WebGLStat.MAX_VERTEX_ATTRIBUTES,
        attributesUsed,
        instanceAttributes,
        vertexAttributes
      );
      type = LayerBufferType.UNIFORM;
    }

    // Apply the type to the layer
    this.setBufferType(type);

    return type;
  }

  /**
   * This generates the buffer manager to be used to manage instances getting
   * applied to attribute locations.
   */
  makeLayerBufferManager(
    gl: WebGLRenderingContext,
    scene: LayerScene,
    shaderIO: IShaderInitialization<TInstance>
  ) {
    // Esnure the buffering type has been calculated for the layer
    const type = this.getLayerBufferType(
      gl,
      shaderIO,
      this.shaderIOInfo.vertexAttributes,
      this.shaderIOInfo.instanceAttributes
    );

    switch (type) {
      case LayerBufferType.INSTANCE_ATTRIBUTE: {
        this.setBufferManager(new InstanceAttributeBufferManager(this, scene));
        break;
      }

      case LayerBufferType.INSTANCE_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new InstanceAttributePackingBufferManager(this, scene)
        );
        break;
      }

      case LayerBufferType.VERTEX_ATTRIBUTE: {
        this.setBufferManager(new VertexAttributeBufferManager(this, scene));
        break;
      }

      case LayerBufferType.VERTEX_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new VertexAttributePackingBufferManager(this, scene)
        );
        break;
      }

      // Anything not utiliziing a specialized buffering strategy will use the
      // uniform compatibility mode
      default: {
        this.setBufferManager(new UniformBufferManager(this, scene));
        break;
      }
    }
  }

  /**
   * This checks the state of the layer and determines how it should handle it's
   * diff event handlers
   */
  updateDiffHandlers() {
    // See if there are any attributes that have  auto easing involved
    const easing = (this.shaderIOInfo.instanceAttributes || []).find((check) =>
      Boolean(check && check.easing)
    );

    // Establish the diff processing this layer needs to do based on the Easing
    // IO present This will ensure there is not already some diff manager
    // handling already established as a base layer's implementation.
    if (easing) {
      if (this.picking.type === PickType.SINGLE) {
        this.onDiffAdd = this.handleDiffAddWithPickingAndEasing;
        this.onDiffRemove = this.handleDiffRemoveWithPickingAndEasing;
      } else {
        this.onDiffAdd = this.handleDiffAddWithEasing;
        this.onDiffRemove = this.handleDiffRemoveWithEasing;
      }
    } else {
      if (this.picking.type === PickType.SINGLE) {
        this.onDiffAdd = this.handleDiffAddWithPicking;
        this.onDiffRemove = this.handleDiffRemoveWithPicking;
      }
    }
  }

  /**
   * This is the default implementation for onDiffManagerAdd that gets applied
   * if easing is present in the layer's IO.
   */
  private handleDiffAddWithEasing(instance: TInstance) {
    instance.easingId = this.easingId;
  }

  /**
   * Handles diff manager add operations when the layer has picking enabled
   */
  private handleDiffAddWithPicking(instance: TInstance) {
    // Make sure the instance is mapped to it's UID
    this.uidToInstance.set(instance.uid, instance);
  }

  /**
   * Handles diff manager add operations when the layer has picking AND easing
   * enabled
   */
  private handleDiffAddWithPickingAndEasing(instance: TInstance) {
    // Make sure the instance is mapped to it's UID
    this.uidToInstance.set(instance.uid, instance);
    // Make sure the instance has it's easing identifiers available for it's use within this layer
    instance.easingId = this.easingId;
  }

  /**
   * This is the default implementation for onDiffManagerRemove that gets
   * applied if easing is present in the layer's IO
   */
  private handleDiffRemoveWithEasing(instance: TInstance) {
    if (instance.easing) delete instance.easing;
    delete instance.easingId;
  }

  /**
   * Handles diff manager remove operations when the layer has picking enabled
   */
  private handleDiffRemoveWithPicking(instance: TInstance) {
    // Remove the instance from our identifier list to prevent memory zombies
    this.uidToInstance.delete(instance.uid);
  }

  /**
   * Handles diff manager remove operations when the layer has picking AND
   * easing enabled
   */
  private handleDiffRemoveWithPickingAndEasing(instance: TInstance) {
    // Remove the instance from our identifier list to prevent memory zombies
    this.uidToInstance.delete(instance.uid);
    // Remove the reference to the easing identifiers to prevent memory zombies
    if (instance.easing) delete instance.easing;
    delete instance.easingId;
  }

  /**
   * This tells the framework to rebuild the layer from scratch, thus
   * reconstructing the shaders and geometries of the layer.
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
   * Retrieves the changes from the data provider and resolves the provider.
   * This should be used by sub Layer classes that wish to create their own
   * custom draw handlers.
   *
   * Set preserverProvider to true to let the system know the provider's changes
   * are still required.
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
   * Applies a buffer manager to the layer which handles instance changes and
   * applies those changes to an appropriate buffer at the appropriate location.
   */
  setBufferManager(
    bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>
  ) {
    if (!this._bufferManager) {
      this._bufferManager = bufferManager;
      this.diffManager = new InstanceDiffManager<TInstance, TProps>();
      this.diffManager.makeProcessor(this, bufferManager);
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
    if (this._bufferType === void 0) {
      this._bufferType = val;
    } else {
      console.warn(
        "You can not change a layers buffer strategy once it has been instantiated."
      );
    }
  }

  /**
   * This method returns a flag indicating whether or not the layer should
   * trigger it's view to redraw. By default, a redraw is triggered (this
   * returns true) when a shallow comparison of the current props and the
   * incoming props are different. This method can be overridden to place custom
   * logic at this point to indicate when redraws should happen.
   *
   * NOTE: This should be considered for redraw logic centered around changes in
   * the layer itself. There ARE additional triggers in the system that causes
   * redraws. This method just aids in ensuring necessary redraws take place for
   * layer level logic and props.
   */
  shouldDrawView(oldProps: TProps, newProps: TProps) {
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) return true;
    }

    return false;
  }

  /**
   * This triggers the layer to update the material uniforms that have been
   * created for the layer. This is primarily used internally.
   */
  updateUniforms() {
    let uniform: IUniformInternal;
    let value: UniformIOValue;

    // Loop through the uniforms that are across all instances
    for (let i = 0, end = this.shaderIOInfo.uniforms.length; i < end; ++i) {
      uniform = this.shaderIOInfo.uniforms[i];
      value = uniform.update(uniform);
      uniform.materialUniforms.forEach(
        (materialUniform) => (materialUniform.data = value)
      );
    }
  }

  /**
   * Lifecycle: Fires before the props object is updated with the newProps.
   * Allows layer to respond to diff changes.
   */
  willUpdateProps(newProps: ILayerProps<TInstance>) {
    // Pick type changes needs to trigger layer rebuild.
    if (newProps.picking !== this.props.picking) {
      this.rebuildLayer();
    }

    // Populate the ref with the information of this layer
    if (newProps.ref !== this.props.ref && this.props.ref) {
      this.props.ref.easing = this.easingManager;
    }
  }
}
