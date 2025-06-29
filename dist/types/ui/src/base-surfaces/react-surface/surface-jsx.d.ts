import "./surface-jsx.scss";
import React from "react";
import { EventManager } from "../../event-management/index.js";
import { Instance } from "../../instance-provider/instance.js";
import { BaseResourceOptions } from "../../resources/index.js";
import { ILayerProps, ISceneOptions, ISurfaceOptions, IViewProps, LayerInitializer, Surface, ViewInitializer } from "../../surface/index.js";
import { type createLayer } from "../../util/index.js";
import { PromiseResolver } from "../../util/promise-resolver.js";
export interface ISurfaceJSX {
    /** Accepts children */
    children?: React.ReactNode;
    /** Custom class name for the container element */
    className?: string;
    /** Props to apply to the container element of the DOM */
    containerProps?: React.HTMLProps<HTMLDivElement>;
    /**
     * Options used to specify settings for the surface itself and how it will be
     * composited in the DOM. This includes top level configuration like canvas
     * alpha support and other items.
     */
    options?: ISurfaceOptions["rendererOptions"];
    /**
     * Indicates if the surface should handle wheel events. Set to false to
     * disable
     */
    handlesWheelEvents?: boolean;
    /**
     * A resolver can be passed in to help get feedback when a surface and all of
     * it's resources and refs are ready and populated.
     */
    ready?: PromiseResolver<Surface>;
    /**
     * When this is set to true, the surface resources will be written to
     * the DOM. This is intended for debugging and probably hurts performance when
     * turned on.
     */
    writeToDom?: boolean;
    /**
     * The pixel ratio to use when rendering. When not provided, this will match
     * the pixel density of the user's monitor.
     */
    pixelRatio?: number;
    /**
     * Add or modify the IO expanders that controls the capabilities of the IO
     * configuration for shaders.
     */
    ioExpansion?: ISurfaceOptions["ioExpansion"];
    /**
     * Add or modify the shader transforms that should be applied to the surface
     * which controls the final output of how the shader will be generated.
     */
    shaderTransforms?: ISurfaceOptions["shaderTransforms"];
    /**
     * Add or modify the resource managers that controls resource requests
     * delivered from layers and the instance diff changes.
     */
    resourceManagers?: ISurfaceOptions["resourceManagers"];
    /**
     * If this is defined, this causes the specified targets to NOT render UNLESS
     * expressly told to render utilizing enableOutput
     */
    optimizedOutputTargets?: number[];
    /**
     * Will render for the specified number of frames then stop. This is useful
     * for running simulations to a certain point, or for debugging your pipeline.
     */
    renderFrameCount?: number;
    /**
     * Forces a closish frame rate specified by the number of frames per second.
     * This still renders on an animation frame, so it will not enforce a strict
     * rate but do a closest matching to the animation frame rate.
     */
    frameRate?: number;
    /**
     * Stops the render loop when set to true.
     */
    stop?: boolean;
}
export interface ISurfaceContext {
    /**
     * Passes the IReactSurface prop to the children of this component.
     */
    writeToDom?: boolean;
    /** All registered event resolvers */
    eventResolvers?: Map<string, PromiseResolver<EventManager | null>> | null;
    /** All registered resource resolvers */
    resourceResolvers?: Map<string, PromiseResolver<BaseResourceOptions | null>> | null;
    /** All registered view resolvers */
    viewResolvers?: Map<string, PromiseResolver<ViewInitializer<IViewProps> | null>> | null;
    /** All registered layer resolvers */
    layerResolvers?: Map<string, PromiseResolver<LayerInitializer<Instance, ILayerProps<Instance>> | null>> | null;
    /** All registered scene resolvers */
    sceneResolvers?: Map<string, PromiseResolver<ISceneOptions | null>> | null;
    /**
     * This resolves when the surface has mounted all children with all resolvers
     * ready and established for the current pipeline.
     */
    resolversReady?: PromiseResolver<void>;
    /**
     * Triggers the pipeline to be updated. This makes deltav re-evaluate all the
     * current pipeline elements and push updated props to the elements.
     */
    updatePipeline?(): void;
    /**
     * Indicates a layer should be removed from the pipeline.
     */
    disposeLayer?(layerInit: ReturnType<typeof createLayer<any, any>>): void;
}
/** Context the surface provides to all of it's children */
export declare const SurfaceContext: React.Context<Partial<ISurfaceContext> | undefined>;
/**
 * Top level surface component to begin defining a rendering pipeline.
 */
export declare const SurfaceJSX: React.FC<ISurfaceJSX>;
