import { Geometry } from "../gl/geometry";
import { Material } from "../gl/material";
import { Model } from "../gl/model";
import { Instance } from "../instance-provider/instance";
import { InstanceDiff } from "../instance-provider/instance-provider";
import { ResourceRouter } from "../resources";
import { IInstanceAttribute, ILayerMaterialOptions, INonePickingMetrics, IPickInfo, IShaderInitialization, ISinglePickingMetrics, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, LayerBufferType, Omit, PickType } from "../types";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { BufferManagerBase, IBufferLocation } from "./buffer-management/buffer-manager-base";
import { InstanceDiffManager } from "./buffer-management/instance-diff-manager";
import { LayerInteractionHandler } from "./layer-interaction-handler";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";
import { IViewProps, View } from "./view";
/**
 * A type to describe the constructor of a Layer class.
 */
export interface ILayerConstructable<T extends Instance> {
    new (surface: Surface, scene: LayerScene, props: ILayerProps<T>): Layer<any, any>;
}
/**
 * This specifies a class type that can be used in creating a layer with createLayer
 */
export declare type ILayerConstructionClass<T extends Instance, U extends ILayerProps<T>> = ILayerConstructable<T> & {
    defaultProps: U;
};
/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export declare type LayerInitializer = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerProps<Instance>>, ILayerProps<Instance>];
};
/**
 * The internal system layer initializer that hides additional properties the front
 * facing API should not be concerned with.
 */
export declare type LayerInitializerInternal = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>, ILayerPropsInternal<Instance>];
};
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createAttribute<T extends Instance>(options: IInstanceAttribute<T>): IInstanceAttribute<T>;
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createUniform(options: IUniform): IUniform;
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createVertex(options: IVertexAttribute): IVertexAttribute;
/**
 * Used for reactive layer generation and updates.
 */
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
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
    /**
     * This allows for external overriding of the base shader modules for a layer. This can cause a layer to break if the
     * overrides do not provide what the layer is expecting at the least.
     */
    baseShaderModules?(shaderIO: IShaderInitialization<T>, layerModules: {
        fs: string[];
        vs: string[];
    }): {
        fs: string[];
        vs: string[];
    };
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
    /** Executes when the mouse is down on instances (Picking type must be set) */
    onMouseDown?(info: IPickInfo<T>): void;
    /** Executes when the mouse moves on instances (Picking type must be set) */
    onMouseMove?(info: IPickInfo<T>): void;
    /** Executes when the mouse no longer over instances (Picking type must be set) */
    onMouseOut?(info: IPickInfo<T>): void;
    /** Executes when the mouse is newly over instances (Picking type must be set) */
    onMouseOver?(info: IPickInfo<T>): void;
    /** Executes when the mouse button is released when over instances (Picking type must be set) */
    onMouseUp?(info: IPickInfo<T>): void;
    /** Executes when the mouse was down on an instance but is released up outside of that instance (Picking type must be set) */
    onMouseUpOutside?(info: IPickInfo<T>): void;
    /** Executes when the mouse click gesture is executed over instances (Picking type must be set) */
    onMouseClick?(info: IPickInfo<T>): void;
    /**
     * Executes when there are no longer any touches that are down for the layer (Picking type must be set).
     *
     * NOTE: This executes for touches being released inside and outside their respective instance.
     */
    onTouchAllEnd?(info: IPickInfo<T>): void;
    /** Executes when a touch is down on instances. Each touch will produce it's own event (Picking type must be set) */
    onTouchDown?(info: IPickInfo<T>): void;
    /** Executes when a touch is up when over on instances. Each touch will produce it's own event (Picking type must be set) */
    onTouchUp?(info: IPickInfo<T>): void;
    /** Executes when a touch was down on an instance but is released up outside of that instance (Picking type must be set) */
    onTouchUpOutside?(info: IPickInfo<T>): void;
    /** Executes when a touch is moving atop of instances. Each touch will produce it's own event (Picking type must be set) */
    onTouchMove?(info: IPickInfo<T>): void;
    /** Executes when a touch is moves off of an instance. Each touch will produce it's own event (Picking type must be set) */
    onTouchOut?(info: IPickInfo<T>): void;
    /** Executes when a touch moves over instances while the touch is dragged around the screen. (Picking type must be set) */
    onTouchOver?(info: IPickInfo<T>): void;
    /** Executes when a touch moves off of an instance and there is no longer ANY touches over the instance (Picking type must be set) */
    onTouchAllOut?(info: IPickInfo<T>): void;
    /** Executes when a touch taps on instances. (Picking type must be set) */
    onTap?(info: IPickInfo<T>): void;
}
/**
 * Layer properties that contains internal system values
 */
export interface ILayerPropsInternal<T extends Instance> extends ILayerProps<T> {
    /** The system provides this for the layer when the layer is being produced as a child of another layer */
    parent?: Layer<Instance, ILayerProps<Instance>>;
}
/**
 * A base class for generating drawable content
 */
export declare class Layer<T extends Instance, U extends ILayerProps<T>> extends IdentifyByKey {
    /** This MUST be implemented by sublayers in order for proper code hinting to happen */
    static defaultProps: any;
    /** This is the attribute that specifies the _active flag for an instance */
    activeAttribute: IInstanceAttribute<T>;
    /**
     * Calculated end time of all animations that will take place. This will cause the system to keep rendering
     * and not go into an idle state until the time of the last rendered frame has exceeded the time flagged
     * here.
     */
    animationEndTime: number;
    /** This matches an instance to the list of Three uniforms that the instance is responsible for updating */
    private _bufferManager;
    /** Buffer manager is read only. Must use setBufferManager */
    readonly bufferManager: BufferManagerBase<T, IBufferLocation>;
    /** This is the determined buffering strategy of the layer */
    private _bufferType;
    /** Buffer type is private and should not be directly modified */
    readonly bufferType: LayerBufferType;
    /** When a layer creates children, this is populated with those children */
    children?: Layer<Instance, ILayerProps<Instance>>[];
    /** This determines the drawing order of the layer within it's scene */
    depth: number;
    /** This contains the methods and controls for handling diffs for the layer */
    diffManager: InstanceDiffManager<T>;
    /**
     * This gets populated when there are attributes that have easing applied to them. This
     * subsequently gets applied to instances when they get added to the layer.
     */
    easingId: {
        [key: string]: number;
    };
    /** This is the threejs geometry filled with the vertex information */
    geometry: Geometry;
    /** This is the initializer used when making this layer. */
    initializer: LayerInitializer;
    /** This is all of the instance attributes generated for the layer */
    instanceAttributes: IInstanceAttribute<T>[];
    /** Provides the number of vertices a single instance spans */
    instanceVertexCount: number;
    /** This is the handler that manages interactions for the layer */
    interactions: LayerInteractionHandler<T, U>;
    /** The last time stamp this layer had its contents rendered */
    lastFrameTime: number;
    /** The official shader material generated for the layer */
    material: Material;
    /** INTERNAL: For the given shader IO provided this is how many instances can be present per buffer. */
    maxInstancesPerBuffer: number;
    /** Default model configuration for rendering in the gl layer */
    model: Model;
    /** This indicates whether this layer needs to draw */
    needsViewDrawn: boolean;
    /** Helps assert rendering order. Lower numbers render first. */
    order?: number;
    /** If this is populated, then this layer is the product of a parent producing this layer. */
    parent?: Layer<Instance, ILayerProps<Instance>>;
    /** This is all of the picking metrics kept for handling picking scenarios */
    picking: ISinglePickingMetrics<T> | INonePickingMetrics;
    /** Properties handed to the Layer during a Surface render */
    props: U;
    /** This is the system provided resource manager that lets a layer request Atlas resources */
    resource: ResourceRouter;
    /** This is the layer scene this layer feeds into */
    scene: LayerScene;
    /** This is the surface this layer is generated under */
    surface: Surface;
    /** This is all of the uniforms generated for the layer */
    uniforms: IUniformInternal[];
    /** A uid provided to the layer to give it some uniqueness as an object */
    readonly uid: number;
    private _uid;
    /** This is all of the vertex attributes generated for the layer */
    vertexAttributes: IVertexAttributeInternal[];
    /** This is the view the layer is applied to. The system sets this, modifying will only cause sorrow. */
    view: View<IViewProps>;
    /** This flag indicates if the layer will be reconstructed from scratch next layer rendering cycle */
    willRebuildLayer: boolean;
    constructor(surface: Surface, scene: LayerScene, props: ILayerProps<T>);
    /**
     * This does special initialization by gathering the layers shader IO, generates a material
     * and injects special automated uniforms and attributes to make instancing work for the
     * shader.
     */
    init(): boolean;
    /**
     * This establishes basic modules required by the layer for the shaders. At it's core functionality, it will
     * support the basic properties a layer has to provide, such as Picking modes
     */
    baseShaderModules(shaderIO: IShaderInitialization<T>): {
        fs: string[];
        vs: string[];
    };
    /**
     * This provides a means for a layer to have child layers that are injected immediately after this layer.
     *
     * This essentially lets composite layer management occur allowing the compositer to behave as a layer does
     * but have layers managed by it. This has the advantage of allowing a composition layer able to handle a
     * data provider but split it's processing across it's own internal data providers which is thus picked up
     * by it's child layers and output by the layers.
     */
    childLayers(): LayerInitializer[];
    /**
     * Invalidate and free all resources assocated with this layer.
     */
    destroy(): void;
    /**
     * Lifecycle method for layers to inherit that executes after the props for the layer have been updated
     */
    didUpdateProps(): void;
    /**
     * This is where global uniforms should update their values. Executes every frame.
     */
    draw(): void;
    /**
     * This retrieves the observable IDs for instance observable properties. This triggers a
     * getter of the indicated property.
     *
     * Do NOT use this in intensive loops, try to cache these results where possible.
     */
    getInstanceObservableIds<K extends keyof T>(instance: T, properties: Extract<K, string>[]): {
        [key: string]: number;
    };
    /**
     * The options for a three material without uniforms.
     */
    getMaterialOptions(): ILayerMaterialOptions;
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
    initShader(): IShaderInitialization<T> | null;
    /**
     * Indicates if this layer is managing an instance or not. This is normally done by determining
     * if this layer's buffer manager has assigned buffer space to the instance. In special layer cases
     * this may be overridden here to make the assertion in some other way.
     */
    managesInstance(instance: T): boolean;
    /**
     * This method determines the buffering strategy that the layer should be utilizing based on provided vertex and
     * instance attributes.
     */
    getLayerBufferType<T extends Instance>(_gl: WebGLRenderingContext, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): LayerBufferType;
    /**
     * This generates the buffer manager to be used to manage instances getting applied to attribute locations.
     */
    makeLayerBufferManager(gl: WebGLRenderingContext, scene: LayerScene): void;
    /**
     * This tells the framework to rebuild the layer from scratch, thus reconstructing the shaders and geometries
     * of the layer.
     */
    rebuildLayer(): void;
    /**
     * Retrieves the changes from the data provider and resolves the provider. This should be
     * used by sub Layer classes that wish to create their own custom draw handlers.
     *
     * Set preserverProvider to true to let the system know the provider's changes are still
     * required.
     */
    resolveChanges(preserveProvider?: boolean): [T, import("../types").InstanceDiffType, {
        [key: number]: number;
    }][];
    /**
     * Applies a buffer manager to the layer which handles instance changes and applies those changes
     * to an appropriate buffer at the appropriate location.
     */
    setBufferManager(bufferManager: BufferManagerBase<T, IBufferLocation>): void;
    /**
     * Only allows the buffer type to be set once
     */
    setBufferType(val: LayerBufferType): void;
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
    shouldDrawView(oldProps: U, newProps: U): boolean;
    /**
     * This triggers the layer to update the material uniforms that have been created for the layer.
     * This is primarily used internally.
     */
    updateUniforms(): void;
    /**
     * Lifecycle: Fires before the props object is updated with the newProps. Allows layer to
     * respond to diff changes.
     */
    willUpdateProps(newProps: ILayerProps<T>): void;
}
