import { FragmentOutputType, PickType } from "../../types";
import {
  IEventInteraction,
  IMouseInteraction,
  ITouchInteraction,
} from "../../event-management/types";
import {
  isDefined,
  mapGetWithDefault,
  mapInjectDefault,
  PromiseResolver,
} from "../../util";
import { IViewProps, View } from "../view";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
import { QueuedEventHandler } from "../../event-management/queued-event-handler";

/**
 * This class is an injected event manager for the surface, it specifically
 * handles taking in mouse events intended for view interactions and broadcasts
 * them to the layers that have picking enabled, thus allowing the layers to
 * respond to mouse view locations and broadcast Instance interactions based on
 * the interaction with the View the layer is a part of.
 *
 * In Summary: This is an adapter that takes in interactions to the views and
 * injects those events into the layers associated with the views so that the
 * layers can translate the events to gestures.
 */
export class LayerMouseEvents extends QueuedEventHandler {
  /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
  private isOver = new Set<View<IViewProps>>();
  /** This tracks which views have touches over them */
  private isTouchOver = new Map<number, Set<View<IViewProps>>>();
  /** This is the surface this manager is aiding with broadcasting events to layers */
  private get scenes(): LayerScene[] {
    if (!this.surface || !this.surface.sceneDiffs) return [];
    return this.surface.sceneDiffs.items;
  }
  /**
   * This promise waits for the render to complete. Color picking has a
   * complicated process of needing an event to determine which colors to pick
   * from a view resource. The event needs to provide information for processing
   * colors, then the colors need to be processed, then the processed
   * information needs to be used in the same event flow to the Layer handlers.
   *
   * In addition to this: we want to allow for pipeline controlled processing of
   * the colors!
   *
   * So, this new event management solves all of these problems: We dequeue
   * events before render. We process the color picking position, then we wait
   * for rendering to complete so commands can run, then we continue with the
   * broadcast post render.
   */
  private willRenderResolver?: PromiseResolver<void>;
  private didRenderResolver?: PromiseResolver<void>;

  constructor() {
    super({
      handleClick: async (e: IMouseInteraction) => {
        // Enable picking, then wait for next render
        this.enablePicking();
        await this.willRenderResolver?.promise;
        // Enable picking again, then wait for end of this frame
        this.enablePicking();
        await this.didRenderResolver?.promise;

        // Broadcast interactions
        this.handleInteraction(e, (layer, view) => {
          layer.interactions?.handleMouseClick(view, e);
        });
      },

      handleTap: async (e: ITouchInteraction) => {
        // Enable picking, then wait for next render
        this.enablePicking();
        await this.willRenderResolver?.promise;
        // Enable picking again, then wait for end of this frame
        this.enablePicking();
        await this.didRenderResolver?.promise;

        e.touches.forEach((interaction) => {
          this.handleInteraction(interaction, (layer, view) => {
            layer.interactions?.handleTap(view, e, interaction);
          });
        });
      },

      handleDrag: async (e: IMouseInteraction) => {
        await this.willRenderResolver?.promise;

        this.handleInteraction(e, (layer, view) => {
          layer.interactions?.handleMouseDrag(view, e);
        });
      },

      handleMouseDown: async (e: IMouseInteraction) => {
        this.enablePicking();
        await this.willRenderResolver?.promise;

        this.handleInteraction(
          e,
          (layer, view) => layer.interactions?.handleMouseDown(view, e)
        );
      },

      handleTouchDown: async (e: ITouchInteraction) => {
        this.enablePicking();
        await this.willRenderResolver?.promise;

        e.touches.forEach((interaction) => {
          this.handleInteraction(
            interaction,
            (layer, view) =>
              layer.interactions?.handleTouchDown(view, e, interaction)
          );
        });
      },

      handleMouseUp: async (e: IMouseInteraction) => {
        await this.willRenderResolver?.promise;

        this.handleInteraction(
          e,
          (layer, view) => layer.interactions?.handleMouseUp(view, e)
        );
      },

      handleTouchUp: async (e: ITouchInteraction) => {
        await this.willRenderResolver?.promise;

        e.touches.forEach((interaction) => {
          this.handleInteraction(
            interaction,
            (layer, projection) =>
              layer.interactions?.handleTouchUp(projection, e, interaction)
          );
        });
      },

      handleMouseOut: async (e: IMouseInteraction) => {
        await this.willRenderResolver?.promise;

        // All views that are moused over should no longer be considered over and broadcast a mouse out
        this.isOver.forEach((view) => {
          this.handleView(
            view,
            (layer, projection) =>
              layer.interactions?.handleMouseOut(projection, e)
          );
        });

        // Nothing is over anymore
        this.isOver.clear();
      },

      handleTouchOut: async (e: ITouchInteraction) => {
        await this.willRenderResolver?.promise;

        e.touches.forEach((interaction) => {
          const isTouchOver = mapGetWithDefault(
            this.isTouchOver,
            interaction.touch.touch.identifier,
            new Set()
          );

          // All views that are moused over should no longer be considered over and broadcast a mouse out
          isTouchOver.forEach((view) => {
            this.handleView(
              view,
              (layer, projection) =>
                layer.interactions?.handleTouchOut(projection, e, interaction)
            );
          });

          // Nothing is over anymore
          this.isOver.clear();
        });
      },

      handleMouseMove: async (e: IMouseInteraction) => {
        this.enablePicking();
        await this.willRenderResolver?.promise;

        // Get all of the scenes we have interacted with, and broadcast a move event for each
        const allSceneViews = this.handleInteraction(
          e,
          (layer, view) => layer.interactions?.handleMouseMove(view, e)
        );

        // For quick lookups map all of the current SceneViews that are over
        const currentSceneViews = new Set<View<IViewProps>>();
        allSceneViews.forEach((v) => currentSceneViews.add(v));

        // Detect which of the views are no longer over
        this.isOver.forEach((view) => {
          if (!currentSceneViews.has(view)) {
            this.handleView(
              view,
              (layer, projection) =>
                layer.interactions?.handleMouseOut(projection, e)
            );
          }
        });

        // Detect which of the views are newly over
        currentSceneViews.forEach((sceneView) => {
          if (!this.isOver.has(sceneView)) {
            this.handleView(
              sceneView,
              (layer, projection) =>
                layer.interactions?.handleMouseOver(projection, e)
            );
          }
        });

        // Update the current views that are over to the currently over views for next event
        this.isOver = currentSceneViews;
      },

      /**
       * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
       */
      handleTouchDrag: async (e: ITouchInteraction) => {
        this.enablePicking();
        await this.willRenderResolver?.promise;

        e.touches.forEach((interaction) => {
          // Get all of the scenes we have interacted with, and broadcast a move event for each
          const allSceneViews = this.handleInteraction(
            interaction,
            (layer, view) =>
              layer.interactions?.handleTouchMove(view, e, interaction)
          );

          // For quick lookups map all of the current SceneViews that are over
          const currentSceneViews = new Set<View<IViewProps>>();
          allSceneViews.forEach((v) => currentSceneViews.add(v));
          const isTouchOver = mapInjectDefault(
            this.isTouchOver,
            interaction.touch.touch.identifier,
            new Set()
          );

          // Detect which of the views are no longer over
          isTouchOver.forEach((view) => {
            if (!currentSceneViews.has(view)) {
              this.handleView(
                view,
                (layer, projection) =>
                  layer.interactions?.handleTouchOut(projection, e, interaction)
              );
            }
          });

          // Detect which of the views are newly over
          currentSceneViews.forEach((sceneView) => {
            if (!isTouchOver.has(sceneView)) {
              this.handleView(
                sceneView,
                (layer, projection) =>
                  layer.interactions?.handleTouchOver(
                    projection,
                    e,
                    interaction
                  )
              );
            }
          });

          // Update the current views that are over to the currently over views for next event
          this.isTouchOver.set(
            interaction.touch.touch.identifier,
            currentSceneViews
          );
        });
      },
    });
  }

  private enablePicking() {
    if (this.surface) {
      this.surface.enableOptimizedOutput(FragmentOutputType.PICKING);
    }
  }

  /**
   * We want to dequeue the events after a render has taken place.
   */
  willRender() {
    // Clean up the picking information as it's only valid per event
    for (let i = 0, iMax = this.scenes.length; i < iMax; ++i) {
      const scene = this.scenes[i];

      for (let k = 0, kMax = scene.layers.length; k < kMax; ++k) {
        const layer = scene.layers[k];
        delete layer.interactions?.colorPicking;
      }
    }

    // Resolve our previous frame's events that were waiting for a render to
    // complete after enabling picking
    if (this.willRenderResolver) this.willRenderResolver.resolve();
    // Reload the resolver
    this.willRenderResolver = new PromiseResolver<void>();
    // Broadcast all events to the layers
    this.dequeue();
  }

  /**
   * After rendering has completed, we release all handlers waiting for
   * completion.
   */
  async didRender() {
    if (this.didRenderResolver) this.didRenderResolver.resolve();
    this.didRenderResolver = new PromiseResolver<void>();
  }

  private getSceneViewsUnderMouse(e: IEventInteraction) {
    const viewByViewId = new Map<string, View<IViewProps>>();

    // Map the scenes to SceneViews
    for (let i = 0, iMax = this.scenes.length; i < iMax; ++i) {
      const scene = this.scenes[i];

      for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
        const view = scene.views[k];
        viewByViewId.set(view.id, view);
      }
    }

    // Now retrieve and convert each view under the mouse to the scene view it coincides with
    return e.target.views
      .map((viewItem) => viewByViewId.get(viewItem.view.id))
      .filter(isDefined);
  }

  private handleInteraction(
    e: IEventInteraction,
    callback: (layer: Layer<any, any>, view: View<any>) => void
  ) {
    // Get all of the scenes under the mouse
    const views = this.getSceneViewsUnderMouse(e);

    // For every view of every scene, we must tell it's layers it's world space is receiving mouse interactions
    for (let i = 0, iMax = views.length; i < iMax; ++i) {
      const view = views[i];
      this.handleView(view, callback);
    }

    return views;
  }

  private handleView(
    view: View<IViewProps>,
    callback: (layer: Layer<any, any>, view: View<any>) => void
  ) {
    for (let i = 0, iMax = view.scene.layers.length; i < iMax; ++i) {
      const layer = view.scene.layers[i];

      if (layer.picking && layer.picking.type !== PickType.NONE) {
        callback(layer, view);
      }
    }
  }
}
