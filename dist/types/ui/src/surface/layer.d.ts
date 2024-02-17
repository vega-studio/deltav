import { BufferManagerBase, IBufferLocation } from "./buffer-management/buffer-manager-base";
import { ResourceRouter } from "../resources";
import { IInstanceAttribute, IInstanceProvider, IInstancingUniform, ILayerEasingManager, ILayerMaterialOptions, ILayerRef, INonePickingMetrics, IPickInfo, IShaderInitialization, ISinglePickingMetrics, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, LayerBufferType, OutputFragmentShader, PickType, StreamChangeStrategy } from "../types";
import { GLSettings } from "../gl";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { Instance } from "../instance-provider";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { IViewProps, View } from "./view";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";
/**
 * A type to describe the constructor of a Layer class.
 */
export interface ILayerConstructable<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>> {
    new (surface: Surface, scene: LayerScene, props: TLayerProps): Layer<TInstance, TLayerProps>;
}
/**
 * This specifies a class type that can be used in creating a layer with
 * createLayer
 */
export type ILayerConstructionClass<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>> = ILayerConstructable<TInstance, TLayerProps> & {
    defaultProps: TLayerProps;
};
/**
 * This is a pair of a Class Type and the props to be applied to that class
 * type.
 */
export type LayerInitializer<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>> = {
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
        ILayerPropsInternal<Instance>
    ];
};
/**
 * Constructor options when generating a layer.
 */
export interface ILayerProps<TInstance extends Instance> extends IdentifyByKeyOptions {
    /**
     * This allows for external overriding of the base shader modules for a layer.
     * This can cause a layer to break if the overrides do not provide what the
     * layer is expecting at the least.
     */
    baseShaderModules?(shaderIO: IShaderInitialization<TInstance>, layerModules: {
        fs: string[];
        vs: string[];
    }): {
        fs: string[];
        vs: string[];
    };
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
     * Layers as a default renders all content as hardware instanced entities.
     * This means we use instancing strategies down to the hardware. This can
     * cause performance issues for simpler meshes. Often, things like shape
     * primitives can be rendered quicker if they use simple buffers. This may
     * cause some slightly longer update times, but the frame by frame performance
     * can be improved dramatically.
     *
     * This strategy can also be good for a layer rendering a single complex mesh.
     */
    noInstancing?: boolean;
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
export interface ILayerPropsInternal<T extends Instance> extends ILayerProps<T> {
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
    /**
     * These are the fragment shaders associated with each View that is available.
     */
    fs: OutputFragmentShader;
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
    /**
     * This is the vertex shader this layer has produced for processing it's
     * geometry.
     */
    vs: string;
}
/**
 * A base class for generating drawable content
 */
export declare class Layer<TInstance extends Instance, TProps extends ILayerProps<TInstance>> extends IdentifyByKey {
    /**
     * This MUST be implemented by sublayers in order for proper code hinting to
     * happen
     */
    static defaultProps: any;
    /**
     * Calculated end time of all animations that will take place. This will cause
     * the system to keep rendering and not go into an idle state until the time
     * of the last rendered frame has exceeded the time flagged here.
     */
    animationEndTime: number;
    /**
     * This is a flag that allows a system to indicate this layer should always
     * re-render
     */
    isAnimationContinuous: boolean;
    /** Buffer manager is read only. Must use setBufferManager */
    private _bufferManager;
    /**
     * This matches an instance to the data buffers and positions to stream to the
     * GPU for direct updates. Use setBufferManager to change this element.
     */
    get bufferManager(): BufferManagerBase<TInstance, TProps, IBufferLocation>;
    /** Buffer type is private and should not be directly modified */
    private _bufferType?;
    /** This is the determined buffering strategy of the layer */
    get bufferType(): LayerBufferType;
    /** When a layer creates children, this is populated with those children */
    children?: Layer<Instance, ILayerProps<Instance>>[];
    /** This determines the drawing order of the layer within it's scene */
    depth: number;
    /** This contains the methods and controls for handling diffs for the layer */
    diffManager?: InstanceDiffManager<TInstance, TProps>;
    /**
     * This gets populated when there are attributes that have easing applied to
     * them. This subsequently gets applied to instances when they get added to
     * the layer.
     */
    easingId?: {
        [key: string]: number;
    };
    /**
     * This is a manager used to monitor and handle the easing operations of the
     * layer
     */
    private _easingManager;
    get easingManager(): ILayerEasingManager;
    /** This is the initializer used when making this layer. */
    initializer: LayerInitializer<TInstance, TProps>;
    /** This is the handler that manages interactions for the layer */
    interactions?: LayerInteractionHandler<TInstance, TProps>;
    /** The last time stamp this layer had its contents rendered */
    lastFrameTime: number;
    /** This indicates whether this layer needs to draw */
    needsViewDrawn: boolean;
    /** Helps assert rendering order. Lower numbers render first. */
    order?: number;
    /**
     * If this is populated, then this layer is the product of a parent producing
     * this layer.
     */
    parent?: Layer<Instance, ILayerProps<Instance>>;
    /** This is all of the picking metrics kept for handling picking scenarios */
    picking: ISinglePickingMetrics<TInstance> | INonePickingMetrics;
    /** Properties handed to the Layer during a Surface render */
    props: TProps;
    /**
     * This is the system provided resource manager that lets a layer request
     * resources
     */
    resource: ResourceRouter;
    /** This is the layer scene this layer feeds into */
    scene: LayerScene;
    /**
     * This contains the shader IO information generated when the layer was
     * created
     */
    shaderIOInfo: ILayerShaderIOInfo<TInstance>;
    /**
     * This is populated with the current streaming state for committing changes
     * to the GPU. See ILayerProps for how the configuration happens for this
     * object.
     */
    private streamChanges;
    /** This is the surface this layer is generated under */
    surface: Surface;
    /** A uid provided to the layer to give it some uniqueness as an object */
    get uid(): number;
    private _uid;
    /**
     * This maps a uid to the instance. This is only populated if it's needed for
     * the processes the layer uses (such as color picking).
     */
    uidToInstance: Map<number, TInstance>;
    /**
     * This is the view the layer is applied to. This changes as the rendering
     * progresses. A configuration of the surface can specify several views for a
     * set of layers. So, this will change with the current view being rendered
     * during a draw pass.
     *
     * NOTE: The system sets this, modifying it yourself will only cause sorrow.
     */
    view: View<IViewProps>;
    /**
     * This flag indicates if the layer will be reconstructed from scratch next
     * layer rendering cycle
     */
    willRebuildLayer: boolean;
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
    static createRef<T extends ILayerRef>(): T;
    constructor(surface: Surface, scene: LayerScene, props: TProps);
    /**
     * Validates the shader initialization object from the layer.
     */
    private validateShaderIO;
    /**
     * Performs clean ups on the data provided by the layer for the Shader
     * Initialization to make it easier and more reliable to work with when
     * processing.
     */
    private cleanShaderIOElements;
    /**
     * When the layer declares it's shader intiialization, it can specify multiple
     * fragment shader fragments each with their own output target type. We do NOT
     * allow two fragments to point to the same type. This performs a thorough
     * check to ensure that does not happen.
     */
    private checkForDuplicateOutputTypes;
    /**
     * Processes the fragment outputs a layer provides against each view and
     * generates a merged fragment shader with those fragments optimized for each
     * view.
     */
    private processFragmentShadersForEachView;
    /**
     * This performs the actual generation of the vertex and fragment shaders this
     * layer will use. Each fragment shader is now associated with it's respective
     * view and will be generated accordingly.
     */
    private processLayerShaders;
    /**
     * Processes the static vertex information and applies GL Attributes for each
     * item.
     */
    private processVertexAttributes;
    /**
     * This does special initialization by gathering the layers shader IO,
     * generates a material and injects special automated uniforms and attributes
     * to make instancing work for the shader.
     */
    init(views: View<IViewProps>[]): boolean;
    private layerShaderDebugging;
    /**
     * This establishes basic modules required by the layer for the shaders. At
     * it's core functionality, it will support the basic properties a layer has
     * to provide, such as Picking modes
     */
    baseShaderModules(shaderIO: IShaderInitialization<TInstance>): {
        fs: string[];
        vs: string[];
    };
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
    childLayers(): LayerInitializer<Instance, ILayerProps<Instance>>[];
    /**
     * Invalidate and free all resources assocated with this layer.
     */
    destroy(): void;
    /**
     * Lifecycle method for layers to inherit that executes after the props for
     * the layer have been updated
     */
    didUpdateProps(): void;
    /**
     * This is where global uniforms should update their values. Executes every
     * frame.
     */
    draw(): void;
    /**
     * This handles updating our easingManager so references can properly react to
     * easing completion times.
     */
    private updateEasingManager;
    /**
     * This gets the next changes that should be retrieved from a change stream. A
     * stream is when changes are streamed in batches instead of committing all
     * changes in a single update.
     */
    private getNextStreamChanges;
    /**
     * This checks the status of the stream and determines if this layer is locked
     * into a stream or is done processing the stream.
     */
    private updateStreamLock;
    /**
     * This gets the next instance changes to push to the GPU.
     */
    private getChangeList;
    /**
     * This retrieves the observable IDs for instance observable properties. This
     * triggers a getter of the indicated property.
     *
     * Do NOT use this in intensive loops, try to cache these results where
     * possible.
     */
    getInstanceObservableIds<K extends keyof TInstance>(instance: TInstance, properties: Extract<K, string>[]): {
        [key: string]: number;
    };
    /**
     * The options for a GL Material without uniforms.
     */
    getMaterialOptions(): ILayerMaterialOptions;
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
    initShader(): IShaderInitialization<TInstance> | null;
    /**
     * Indicates if this layer is managing an instance or not. This is normally
     * done by determining if this layer's buffer manager has assigned buffer
     * space to the instance. In special layer cases this may be overridden here
     * to make the assertion in some other way.
     */
    managesInstance(instance: TInstance): boolean;
    /**
     * This method determines the buffering strategy that the layer should be
     * utilizing based on provided vertex and instance attributes.
     */
    getLayerBufferType<T extends Instance>(_gl: WebGLRenderingContext, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): LayerBufferType;
    /**
     * This generates the buffer manager to be used to manage instances getting
     * applied to attribute locations.
     */
    makeLayerBufferManager(gl: WebGLRenderingContext, scene: LayerScene): void;
    /**
     * This checks the state of the layer and determines how it should handle it's
     * diff event handlers
     */
    updateDiffHandlers(): void;
    /**
     * This is the default implementation for onDiffManagerAdd that gets applied
     * if easing is present in the layer's IO.
     */
    private handleDiffAddWithEasing;
    /**
     * Handles diff manager add operations when the layer has picking enabled
     */
    private handleDiffAddWithPicking;
    /**
     * Handles diff manager add operations when the layer has picking AND easing
     * enabled
     */
    private handleDiffAddWithPickingAndEasing;
    /**
     * This is the default implementation for onDiffManagerRemove that gets
     * applied if easing is present in the layer's IO
     */
    private handleDiffRemoveWithEasing;
    /**
     * Handles diff manager remove operations when the layer has picking enabled
     */
    private handleDiffRemoveWithPicking;
    /**
     * Handles diff manager remove operations when the layer has picking AND
     * easing enabled
     */
    private handleDiffRemoveWithPickingAndEasing;
    /**
     * This tells the framework to rebuild the layer from scratch, thus
     * reconstructing the shaders and geometries of the layer.
     */
    rebuildLayer(): void;
    /**
     * Retrieves the changes from the data provider and resolves the provider.
     * This should be used by sub Layer classes that wish to create their own
     * custom draw handlers.
     *
     * Set preserverProvider to true to let the system know the provider's changes
     * are still required.
     */
    resolveChanges(preserveProvider?: boolean): import("../types").InstanceDiff<TInstance>[];
    /**
     * Applies a buffer manager to the layer which handles instance changes and
     * applies those changes to an appropriate buffer at the appropriate location.
     */
    setBufferManager(bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>): void;
    /**
     * Only allows the buffer type to be set once
     */
    setBufferType(val: LayerBufferType): void;
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
    shouldDrawView(oldProps: TProps, newProps: TProps): boolean;
    /**
     * This triggers the layer to update the material uniforms that have been
     * created for the layer. This is primarily used internally.
     */
    updateUniforms(): void;
    /**
     * Lifecycle: Fires before the props object is updated with the newProps.
     * Allows layer to respond to diff changes.
     */
    willUpdateProps(newProps: ILayerProps<TInstance>): void;
}
