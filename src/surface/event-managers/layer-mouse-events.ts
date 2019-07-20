import { SimpleEventHandler } from "../../event-management/simple-event-handler";
import {
  IEventInteraction,
  IMouseInteraction,
  ITouchInteraction
} from "../../event-management/types";
import { BaseProjection } from "../../math";
import { PickType } from "../../types";
import {
  isDefined,
  mapGetWithDefault,
  mapInjectDefault,
  nextFrame
} from "../../util";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
import { IViewProps, View } from "../view";

/**
 * This class is an injected event manager for the surface, it specifically handles taking in mouse events intended for view interactions
 * and broadcasts them to the layers that have picking enabled, thus allowing the layers to respond to
 * mouse view locations and broadcast Instance interactions based on the interaction with the View the layer is a part of
 *
 * In Summary: This is an adapter that takes in interactions to the views and injects those events into the layers associated with
 * the views so that the layers can translate the events to gestures.
 */
export class LayerMouseEvents extends SimpleEventHandler {
  /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
  isOver = new Set<View<IViewProps>>();
  /** This tracks which views have touches over them */
  isTouchOver = new Map<number, Set<View<IViewProps>>>();
  /** This is the surface this manager is aiding with broadcasting events to layers */
  get scenes(): LayerScene[] {
    if (!this.surface || !this.surface.sceneDiffs) return [];
    return this.surface.sceneDiffs.items;
  }

  constructor() {
    super({});
  }

  getSceneViewsUnderMouse(e: IEventInteraction) {
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
      .map(viewItem => viewByViewId.get(viewItem.view.id))
      .filter(isDefined);
  }

  handleClick(e: IMouseInteraction) {
    this.handleInteraction(e, (layer, view) => {
      layer.interactions.handleMouseClick(view, e);
    });
  }

  handleTap(e: ITouchInteraction) {
    e.touches.forEach(interaction => {
      this.handleInteraction(interaction, (layer, view) => {
        layer.interactions.handleTap(view, e, interaction);
      });
    });
  }

  handleDrag(e: IMouseInteraction) {
    this.handleInteraction(e, (layer, view) => {
      layer.interactions.handleMouseDrag(view, e);
    });
  }

  handleMouseDown(e: IMouseInteraction) {
    this.handleInteraction(e, (layer, view) =>
      layer.interactions.handleMouseDown(view, e)
    );
  }

  async handleTouchDown(e: ITouchInteraction) {
    const views: View<IViewProps>[] = [];

    e.touches.forEach(interaction => {
      interaction.target.views.forEach(target => views.push(target.view));
    });

    if (this.surface) {
      this.surface.updateColorPickPosition(e.touches[0].screen.position, views);
    }

    await nextFrame();

    e.touches.forEach(interaction => {
      this.handleInteraction(interaction, (layer, view) =>
        layer.interactions.handleTouchDown(view, e, interaction)
      );
    });
  }

  handleMouseUp(e: IMouseInteraction) {
    this.handleInteraction(e, (layer, view) =>
      layer.interactions.handleMouseUp(view, e)
    );
  }

  handleTouchUp(e: ITouchInteraction) {
    e.touches.forEach(interaction => {
      this.handleInteraction(interaction, (layer, view) =>
        layer.interactions.handleTouchUp(view, e, interaction)
      );
    });
  }

  handleMouseOut(e: IMouseInteraction) {
    // All views that are moused over should no longer be considered over and broadcast a mouse out
    this.isOver.forEach(view => {
      this.handleView(view, (layer, view) =>
        layer.interactions.handleMouseOut(view, e)
      );
    });

    // Nothing is over anymore
    this.isOver.clear();
  }

  handleTouchOut(e: ITouchInteraction) {
    e.touches.forEach(interaction => {
      const isTouchOver = mapGetWithDefault(
        this.isTouchOver,
        interaction.touch.touch.identifier,
        new Set()
      );

      // All views that are moused over should no longer be considered over and broadcast a mouse out
      isTouchOver.forEach(view => {
        this.handleView(view, (layer, view) =>
          layer.interactions.handleTouchOut(view, e, interaction)
        );
      });

      // Nothing is over anymore
      this.isOver.clear();
    });
  }

  handleMouseMove(e: IMouseInteraction) {
    if (this.surface) {
      this.surface.updateColorPickPosition(
        e.screen.position,
        e.target.views.map(v => v.view)
      );
    }

    // Get all of the scenes we have interacted with, and broadcast a move event for each
    const allSceneViews = this.handleInteraction(e, (layer, view) =>
      layer.interactions.handleMouseMove(view, e)
    );

    // For quick lookups map all of the current SceneViews that are over
    const currentSceneViews = new Set<View<IViewProps>>();
    allSceneViews.forEach(v => currentSceneViews.add(v));

    // Detect which of the views are no longer over
    this.isOver.forEach(view => {
      if (!currentSceneViews.has(view)) {
        this.handleView(view, (layer, view) =>
          layer.interactions.handleMouseOut(view, e)
        );
      }
    });

    // Detect which of the views are newly over
    currentSceneViews.forEach(sceneView => {
      if (!this.isOver.has(sceneView)) {
        this.handleView(sceneView, (layer, view) =>
          layer.interactions.handleMouseOver(view, e)
        );
      }
    });

    // Update the current views that are over to the currently over views for next event
    this.isOver = currentSceneViews;
  }

  /**
   * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
   */
  handleTouchDrag(e: ITouchInteraction) {
    e.touches.forEach(interaction => {
      if (this.surface) {
        this.surface.updateColorPickPosition(
          interaction.screen.position,
          interaction.target.views.map(v => v.view)
        );
      }

      // Get all of the scenes we have interacted with, and broadcast a move event for each
      const allSceneViews = this.handleInteraction(interaction, (layer, view) =>
        layer.interactions.handleTouchMove(view, e, interaction)
      );

      // For quick lookups map all of the current SceneViews that are over
      const currentSceneViews = new Set<View<IViewProps>>();
      allSceneViews.forEach(v => currentSceneViews.add(v));
      const isTouchOver = mapInjectDefault(
        this.isTouchOver,
        interaction.touch.touch.identifier,
        new Set()
      );

      // Detect which of the views are no longer over
      isTouchOver.forEach(view => {
        if (!currentSceneViews.has(view)) {
          this.handleView(view, (layer, view) =>
            layer.interactions.handleTouchOut(view, e, interaction)
          );
        }
      });

      // Detect which of the views are newly over
      currentSceneViews.forEach(sceneView => {
        if (!isTouchOver.has(sceneView)) {
          this.handleView(sceneView, (layer, view) =>
            layer.interactions.handleTouchOver(view, e, interaction)
          );
        }
      });

      // Update the current views that are over to the currently over views for next event
      this.isTouchOver.set(
        interaction.touch.touch.identifier,
        currentSceneViews
      );
    });
  }

  handleInteraction(
    e: IEventInteraction,
    callback: (layer: Layer<any, any>, view: BaseProjection<any>) => void
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

  handleView(
    view: View<IViewProps>,
    callback: (layer: Layer<any, any>, view: BaseProjection<any>) => void
  ) {
    for (let i = 0, iMax = view.scene.layers.length; i < iMax; ++i) {
      const layer = view.scene.layers[i];

      if (layer.picking && layer.picking.type !== PickType.NONE) {
        callback(layer, view.projection);
      }
    }
  }
}
