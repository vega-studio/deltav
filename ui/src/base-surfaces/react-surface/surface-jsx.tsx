import "./surface-jsx.scss";

import React from "react";

import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import { EventManager } from "../../event-management/index.js";
import { Instance } from "../../instance-provider/instance.js";
import { BaseResourceOptions } from "../../resources/index.js";
import {
  ILayerProps,
  ISceneOptions,
  ISurfaceOptions,
  IViewProps,
  LayerInitializer,
  Surface,
  ViewInitializer,
} from "../../surface/index.js";
import { isDefined } from "../../util/common-filters.js";
import {
  onAnimationLoop,
  onFrame,
  stopAnimationLoop,
} from "../../util/index.js";
import { PromiseResolver } from "../../util/promise-resolver.js";
import { CustomTag } from "./custom-tag.js";
import {
  groupSurfaceChildren,
  SurfaceJSXType,
} from "./group-surface-children.js";
import { concatChildren, useChildResolvers } from "./use-child-resolver.js";

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
}

export interface ISurfaceContext {
  /**
   * Passes the IReactSurface prop to the children of this component.
   */
  writeToDom?: boolean;
  /** All registered event resolvers */
  eventResolvers?: Map<string, PromiseResolver<EventManager | null>> | null;
  /** All registered resource resolvers */
  resourceResolvers?: Map<
    string,
    PromiseResolver<BaseResourceOptions | null>
  > | null;
  /** All registered view resolvers */
  viewResolvers?: Map<
    string,
    PromiseResolver<ViewInitializer<IViewProps> | null>
  > | null;
  /** All registered layer resolvers */
  layerResolvers?: Map<
    string,
    PromiseResolver<LayerInitializer<Instance, ILayerProps<Instance>> | null>
  > | null;
  /** All registered scene resolvers */
  sceneResolvers?: Map<string, PromiseResolver<ISceneOptions | null>> | null;
  /**
   * This resolves when the surface has mounted all children with all resolvers
   * ready and established for the current pipeline.
   */
  resolversReady?: PromiseResolver<void>;
}

/** Context the surface provides to all of it's children */
export const SurfaceContext = React.createContext<
  Partial<ISurfaceContext> | undefined
>(void 0);

/**
 * Top level surface component to begin defining a rendering pipeline.
 */
export const SurfaceJSX: React.FC<ISurfaceJSX> = (props) => {
  const container = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const currentTime = React.useRef(0);
  const surface = React.useRef<Surface | null>(null);
  const drawLoopId = React.useRef<Promise<number> | null>(null);
  const resizeDebounceId = React.useRef(-1);

  // Generate the Surface context content
  const eventResolvers = React.useRef(
    new Map<string, PromiseResolver<EventManager | null>>()
  );
  const resourceResolvers = React.useRef(
    new Map<string, PromiseResolver<BaseResourceOptions | null>>()
  );
  const viewResolvers = React.useRef(
    new Map<string, PromiseResolver<ViewInitializer<IViewProps> | null>>()
  );
  const layerResolvers = React.useRef(
    new Map<
      string,
      PromiseResolver<LayerInitializer<Instance, ILayerProps<Instance>> | null>
    >()
  );
  const sceneResolvers = React.useRef(
    new Map<string, PromiseResolver<ISceneOptions | null>>()
  );
  const resolversReady = React.useRef(new PromiseResolver<void>());

  // As we work through our lists of children and clone and aggregate them, we
  // will need to ensure our key uniqueness is retained amongst them.
  const childKey = { current: 0 };

  // On a new render cycle, we need to establish all of our child assets for
  // this surface. Most of the asset handling is through promise resolvers that
  // resolve their resources the the necessary resources for the surface.

  // Group all of our children into child types
  const excluded: React.ReactNode[] = [];
  const groups = groupSurfaceChildren(props.children, void 0, excluded);

  if (excluded.length) {
    console.warn("Surface found unsupported children", excluded);
  }

  // Get all child groups and the resolvers we will use for them to retreve the
  // resources they will provide.
  const [eventManagers, eventsPromise] = useChildResolvers<EventManager>(
    eventResolvers.current,
    groups,
    SurfaceJSXType.EVENT_MANAGER,
    childKey
  );
  const [resources, resourcesPromise] = useChildResolvers<BaseResourceOptions>(
    resourceResolvers.current,
    groups,
    SurfaceJSXType.RESOURCE,
    childKey
  );
  const [scenes, scenesPromise, { nameConflict: sceneNameConflict }] =
    useChildResolvers<ISceneOptions>(
      sceneResolvers.current,
      groups,
      SurfaceJSXType.SCENE,
      childKey
    );
  // Top level layers and views with no scene will be put under a default "root"
  // scene with no name.
  const [layers, layersPromise, { nameConflict: layerNameConflict }] =
    useChildResolvers<LayerInitializer<Instance, ILayerProps<Instance>>>(
      layerResolvers.current,
      groups,
      SurfaceJSXType.LAYER,
      childKey
    );

  const [views, viewsPromise, { nameConflict: viewNameConflict }] =
    useChildResolvers<ViewInitializer<IViewProps>>(
      viewResolvers.current,
      groups,
      SurfaceJSXType.VIEW,
      childKey
    );

  if (sceneNameConflict.size > 0) {
    console.warn(`Root Scene name conflict:`, sceneNameConflict);
    return;
  }

  if (layerNameConflict.size > 0) {
    console.warn(`Root Scene Layer name conflict:`, layerNameConflict);
    return;
  }

  if (viewNameConflict.size > 0) {
    console.warn(`Root Scene View name conflict:`, viewNameConflict);
    return;
  }

  /**
   * The draw loop of the surface
   */
  const draw = async (time: number) => {
    if (!surface.current) return;
    currentTime.current = time;
    surface.current.draw(time);
  };

  /**
   * Fits the surface to it's current container size.
   */
  const fitContainer = (preventRedraw?: boolean) => {
    canvasRef.current?.remove();

    surface.current?.resize(
      container.current?.offsetWidth || 0,
      container.current?.offsetHeight || 0
    );

    if (canvasRef.current) container.current?.appendChild(canvasRef.current);
    if (!preventRedraw) surface.current?.draw(currentTime.current);
  };

  const resize = () => {
    window.clearTimeout(resizeDebounceId.current);
    resizeDebounceId.current = window.setTimeout(() => {
      fitContainer(true);
    });
  };

  // Lifecycle handling
  useLifecycle({
    async didMount() {
      if (!canvasRef.current || !container.current) return;

      // Let everything resolve as parellel as possible.
      const [
        resolvedEventManagers,
        resolvedResources,
        resolvedScenes,
        resolvedLayers,
        resolvedViews,
      ] = await Promise.all([
        eventsPromise,
        resourcesPromise,
        scenesPromise,
        layersPromise,
        viewsPromise,
      ]);

      // Remove any null values
      const validScenes = resolvedScenes.filter(isDefined);
      const validEventManagers = resolvedEventManagers.filter(isDefined);
      const validResources = resolvedResources.filter(isDefined);
      const validLayers = resolvedLayers.filter(isDefined);
      const validViews = resolvedViews.filter(isDefined);

      // Do some validation
      if (
        resolvedScenes.length <= 0 &&
        (!validLayers?.length || !validViews?.length)
      ) {
        console.error(
          "No scenes or root level Layers+Views provided to surface"
        );
        return;
      }

      // Add the root level layers and views to the scenes
      if (validViews.length && validLayers.length) {
        validScenes.unshift({
          key: "root",
          layers: validLayers,
          views: validViews,
        });
      }

      // With all resources established at this point, we now construct the
      // surface to display.
      const newSurface = await new Surface({
        context: canvasRef.current,
        handlesWheelEvents:
          props.handlesWheelEvents !== undefined
            ? props.handlesWheelEvents
            : true,
        pixelRatio: props.pixelRatio || window.devicePixelRatio,
        eventManagers: validEventManagers,
        ioExpansion: props.ioExpansion,
        shaderTransforms: props.shaderTransforms,
        resourceManagers: props.resourceManagers,
        rendererOptions: Object.assign(
          // Default render options
          {
            alpha: true,
            antialias: false,
          },
          // Implementation specified render options
          props.options
        ),
      }).ready;

      // Starts the render loop to keep updating.
      drawLoopId.current = onAnimationLoop(draw);

      // Update the pipeline with the current rendering elements
      newSurface.pipeline({
        resources: validResources,
        scenes: validScenes,
      });

      surface.current = newSurface;
      // Let a single render happen to ensure that everything is ready
      await onFrame();
      // Size the surface to the initial container layout
      fitContainer(true);
      // Pass back feed back that our resources are initialized
      props.ready?.resolve(surface.current);

      window.addEventListener("resize", resize);

      // Unmount
      return () => {
        window.removeEventListener("resize", resize);
        // Quit the animation loop
        stopAnimationLoop(drawLoopId.current!);
        // Destroy the surface
        surface.current?.destroy();
      };
    },
  });

  // We render our canvas, but also render our children. This allows the
  // children to inject custom DOM mostly for interesting ways to review and
  // debug the contents of the surface.
  return (
    <div
      ref={container}
      data-deltav-version={import.meta.env.VITE_RELEASE_VERSION || "unknown"}
      className={`SurfaceJSX ${props.className || ""}`}
      {...props.containerProps}
    >
      <canvas ref={canvasRef}>
        <SurfaceContext.Provider
          value={{
            writeToDom: props.writeToDom,
            eventResolvers: eventResolvers.current,
            resourceResolvers: resourceResolvers.current,
            viewResolvers: viewResolvers.current,
            layerResolvers: layerResolvers.current,
            sceneResolvers: sceneResolvers.current,
            resolversReady: resolversReady.current,
          }}
        >
          <CustomTag tagName="Surface" {...props}>
            {concatChildren(eventManagers, resources, views, layers, scenes)}
          </CustomTag>
        </SurfaceContext.Provider>
      </canvas>
    </div>
  );
};
