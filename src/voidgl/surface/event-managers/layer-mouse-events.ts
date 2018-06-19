import { IPoint } from '../../primitives/point';
import { IProjection, PickType } from '../../types';
import { EventManager } from '../event-manager';
import { Layer } from '../layer';
import { IDragMetrics, IMouseInteraction, SceneView } from '../mouse-event-manager';

function isDefined<T>(val: T | null | undefined): val is T {
  return Boolean(val);
}

/**
 * This class is an injected event manager for the surface, it specifically handles taking in mouse events intended for view interactions
 * and broadcasts them to the layers that have picking enabled, thus allowing the layers to respond to
 * mouse view locations and broadcast Instance interactions based on the interaction with the View the layer is a part of
 *
 * In Summary: This is an adapter that takes in interactions to the views and injects those events into the layers associated with
 * the views so that the layers can translate the events to gestures.
 */
export class LayerMouseEvents extends EventManager {
  /** This is the surface this manager is aiding with broadcasting events to layers */
  sceneViews: SceneView[];
  /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
  isOver = new Map<SceneView, boolean>();

  constructor(sceneViews: SceneView[]) {
    super();
    this.sceneViews = sceneViews;
  }

  getSceneViewsUnderMouse(e: IMouseInteraction) {
    const sceneViewByViewId = new Map<string, SceneView>();

    // Map the scene views by the view's identifiers
    for (const sceneView of this.sceneViews) {
      sceneViewByViewId.set(sceneView.view.id, sceneView);
    }

    // Now retrieve and convert each view under the mouse to the scene view it coincides with
    return e.viewsUnderMouse.map(viewItem => sceneViewByViewId.get(viewItem.view.id)).filter(isDefined);
  }

  getMouseByViewId(e: IMouseInteraction) {
    // This is the mouse position for the provided view in view space
    const viewMouseByViewId = new Map<string, IPoint>();

    for (const viewItem of e.viewsUnderMouse) {
      viewMouseByViewId.set(viewItem.view.id, viewItem.mouse);
    }

    return viewMouseByViewId;
  }

  handleClick(e: IMouseInteraction, button: number) {
    this.handleInteraction(e, (layer, view, mouse) => layer.interactions.handleMouseClick(view, mouse, button));
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    this.handleInteraction(e, (layer, view, mouse) => layer.interactions.handleMouseDrag(view, mouse));
  }

  handleInteraction(e: IMouseInteraction, callback: (layer: Layer<any, any, any>, view: IProjection, mouse: IPoint) => void) {
    // Get all of the scenes under the mouse
    const sceneViews = this.getSceneViewsUnderMouse(e);
    // Get a lookup of a view id to the mouse position in the view
    const viewMouseByViewId = this.getMouseByViewId(e);

    // For every view of every scene, we must tell it's layers it's world space is receiving mouse interactions
    for (const sceneView of sceneViews) {
      this.handleSceneView(sceneView, viewMouseByViewId, callback);
    }

    return sceneViews;
  }

  handleMouseDown(e: IMouseInteraction, button: number) {
    this.handleInteraction(e, (layer, view, mouse) => layer.interactions.handleMouseDown(view, mouse, button));
  }

  handleMouseUp(e: IMouseInteraction, button: number) {
    this.handleInteraction(e, (layer, view, mouse) => layer.interactions.handleMouseUp(view, mouse, button));
  }

  handleMouseOver(e: IMouseInteraction) {
    // We let the mouse move event handle the registration of moused over views
  }

  handleMouseOut(e: IMouseInteraction) {
    // Get a lookup of a view id to the mouse position in the view
    const viewMouseByViewId = this.getMouseByViewId(e);
    const screen = e.screen.mouse;

    // All views that are moused over should no longer be considered over and broadcast a mouse out
    this.isOver.forEach((flag, sceneView) => {
      // Since we are leaving the view we must make the view relative cooridinates fromt he screen space coords
      viewMouseByViewId.set(sceneView.view.id, sceneView.view.screenToView(screen));

      this.handleSceneView(
        sceneView,
        viewMouseByViewId,
        (layer, view, mouse) => layer.interactions.handleMouseOut(view, mouse),
      );
    });

    // Nothing is over anymore
    this.isOver.clear();
  }

  handleMouseMove(e: IMouseInteraction) {
    // Get all of the scenes we have interacted with, and broadcast a move event for each
    const allSceneViews = this.handleInteraction(e, (layer, view, mouse) => layer.interactions.handleMouseMove(view, mouse));
    // Get a lookup of a view id to the mouse position in the view
    const viewMouseByViewId = this.getMouseByViewId(e);
    // Get the position of the mouse on the screen
    const screen = e.screen.mouse;

    // For quick lookups map all of the current SceneViews that are over
    const currentSceneViews = new Map<SceneView, boolean>();
    allSceneViews.forEach(v => currentSceneViews.set(v, true));

    // Detect which of the views are newly over
    currentSceneViews.forEach((flag, sceneView) => {
      if (!this.isOver.get(sceneView)) {
        this.handleSceneView(
          sceneView,
          viewMouseByViewId,
          (layer, view, mouse) => layer.interactions.handleMouseOver(view, mouse),
        );
      }
    });

    // Detect which of the views are no longer over
    this.isOver.forEach((flag, sceneView) => {
      if (!currentSceneViews.get(sceneView)) {
        // Since these views were not interacted with, we must create the mouse interaction position
        viewMouseByViewId.set(sceneView.view.id, sceneView.view.screenToView(screen));

        this.handleSceneView(
          sceneView,
          viewMouseByViewId,
          (layer, view, mouse) => layer.interactions.handleMouseOut(view, mouse),
        );
      }
    });

    // Update the current views that are over to the currently over views for next event
    this.isOver = currentSceneViews;
  }

  handleSceneView(sceneView: SceneView, viewMouseByViewId: Map<string, IPoint>, callback: (layer: Layer<any, any, any>, view: IProjection, mouse: IPoint) => void) {
    const view = sceneView.view;
    const mouse = viewMouseByViewId.get(view.id);

    if (mouse) {
      for (const layer of sceneView.scene.layers) {
        if (layer.picking && layer.picking.type === PickType.ALL) {
          callback(layer, view, mouse);
        }
      }
    }
  }

  handleWheel(e: IMouseInteraction) {
    // TODO: This may need to be implemented. As of right now, there is no particular benefit
  }
}
