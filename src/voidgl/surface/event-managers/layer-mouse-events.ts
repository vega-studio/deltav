import { IPoint } from '../../primitives/point';
import { EventManager } from '../event-manager';
import { PickType } from '../layer';
import { IDragMetrics, IMouseInteraction, SceneView } from '../mouse-event-manager';

/**
 * This class is an injected event manager for the surface, it specifically handles taking in mouse events
 * and broadcasting them to the layers that have picking enabled, thus allowing the layers to respond to
 * mouse locations and broadcast Instance interactions.
 */
export class LayerMouseEvents extends EventManager {
  /** This is the surface this manager is aiding with broadcasting events to layers */
  sceneViews: SceneView[];

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
    return e.viewsUnderMouse.map(viewItem => sceneViewByViewId.get(viewItem.view.id));
  }

  getMouseByViewId(e: IMouseInteraction) {
    // This is the mouse position for the provided view in view space
    const viewMouseByViewId = new Map<string, IPoint>();

    for (const viewItem of e.viewsUnderMouse) {
      viewMouseByViewId.set(viewItem.view.id, viewItem.mouse);
    }

    return viewMouseByViewId;
  }

  handleMouseDown(e: IMouseInteraction, button: number) {
    // Get all of the scenes under the mouse
    const sceneViews = this.getSceneViewsUnderMouse(e);
    // Get a lookup of a view id to the mouse position in the view
    const viewMouseByViewId = this.getMouseByViewId(e);

    // For every view of every scene, we must tell it's layers it's world space is receiving mouse interactions
    for (const sceneView of sceneViews) {
      const view = sceneView.view;
      const mouse = viewMouseByViewId.get(view.id);

      for (const layer of sceneView.scene.layers) {
        if (layer.picking && layer.picking.type === PickType.ALL) {
          layer.interactions.handleMouseDown(view, mouse);
        }
      }
    }
  }

  handleMouseUp(e: IMouseInteraction) {
    console.warn('MOUSE UP', e);
  }

  handleMouseOver(e: IMouseInteraction) {
    console.warn('MOUSE OVER', e);
  }

  handleMouseOut(e: IMouseInteraction) {
    console.warn('MOUSE OUT', e);
  }

  handleMouseMove(e: IMouseInteraction) {
    console.warn('MOUSE MOVE', e);
  }

  handleClick(e: IMouseInteraction, button: number) {
    console.warn('CLICK', e, button);
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    console.warn('DRAG', e, drag);
  }
}
