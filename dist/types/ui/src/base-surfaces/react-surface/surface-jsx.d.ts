import React from "react";
import { BaseResourceOptions } from "../../resources/index.js";
import { EventManager } from "../../event-management/index.js";
import { ILayerProps, ISceneOptions, ISurfaceOptions, IViewProps, LayerInitializer, Surface, ViewInitializer } from "../../surface/index.js";
import { Instance } from "../../instance-provider/instance.js";
import { PromiseResolver } from "../../util/promise-resolver.js";
import "./surface-jsx.scss";
export interface ISurfaceJSX {
    /** Accepts children */
    children?: React.ReactNode;
    /** Custom class name for the container element */
    className?: string;
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
}
/** Context the surface provides to all of it's children */
export declare const SurfaceContext: React.Context<Partial<ISurfaceContext> | undefined>;
/**
 * Top level surface component to begin defining a rendering pipeline.
 */
export declare const SurfaceJSX: React.FC<ISurfaceJSX>;
