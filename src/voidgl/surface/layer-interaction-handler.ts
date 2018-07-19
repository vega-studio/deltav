import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives";
import { IPoint } from "../primitives/point";
import {
  IColorPickingData,
  InstanceHitTest,
  IPickInfo,
  IProjection,
  PickType
} from "../types";
import { TrackedQuadTree } from "../util";
import { ILayerProps, Layer } from "./layer";

/**
 * This manages mouse gestures broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 *
 * This class, in summary, takes in the gestures to the view and converts them to gestures to the instances.
 */
export class LayerInteractionHandler<
  T extends Instance,
  U extends ILayerProps<T>
> {
  /** This is the color picking information most recently rendered */
  colorPicking?: IColorPickingData;
  /** This tracks the elements that have the mouse currently over them */
  isMouseOver = new Map<T, boolean>();
  /** This tracks the elements the mouse was down on */
  isMouseDown = new Map<T, boolean>();
  /** This is the layer the interaction handler manages events for */
  layer: Layer<T, U>;

  constructor(layer: Layer<T, U>) {
    this.layer = layer;
  }

  /**
   * Retrieves the color picking instance determined for the procedure.
   */
  getColorPickInstance() {
    if (this.colorPicking) {
      return this.layer.diffManager.colorPicking.uidToInstance.get(
        0xffffff - this.colorPicking.nearestColor
      );
    }

    return null;
  }

  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseOver(_view: IProjection, _mouse: IPoint) {
    // This is the mouse over for the view itself. We should probably just let the mouse over events handle the interactions
    // With the instances
  }

  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseDown(view: IProjection, mouse: IPoint, button: number) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseDown } = this.layer.props;

      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseDown) {
        const world = view.viewToWorld(mouse);
        let hitTest: InstanceHitTest<T>;
        let query: TrackedQuadTree<T>["query"];
        let querySpace;
        let instances: T[] = [];

        if (this.layer.picking.type === PickType.ALL) {
          hitTest = this.layer.picking.hitTest;
          query = this.layer.picking.quadTree.query.bind(
            this.layer.picking.quadTree
          );
          querySpace = (check: Bounds | IPoint) =>
            query(check).filter(o => hitTest(o, world, view));
          instances = query(world).filter(o => hitTest(o, world, view));
        } else if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        const info: IPickInfo<T> = {
          button,
          instances,
          layer: this.layer.id,
          projection: view,
          querySpace,
          screen: [mouse.x, mouse.y],
          world: [world.x, world.y]
        };

        onMouseDown(info);

        // We track all the elements the mouse is currently down on
        this.isMouseDown.clear();
        instances.forEach(o => this.isMouseDown.set(o, true));
      }
    }
  }

  /**
   * Handles mouse out events for a layer within the view
   */
  handleMouseOut(view: IProjection, mouse: IPoint) {
    // This will fire an instance mouse out for any over instances in the queue since we left the view
    // Thus no instances shall be considered 'over'
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseOut } = this.layer.props;

      if (onMouseOut) {
        const world = view.viewToWorld(mouse);
        let hitTest: InstanceHitTest<T>;
        let query: TrackedQuadTree<T>["query"];
        let querySpace;

        if (this.layer.picking.type === PickType.ALL) {
          hitTest = this.layer.picking.hitTest;
          query = this.layer.picking.quadTree.query.bind(
            this.layer.picking.quadTree
          );
          querySpace = (check: Bounds | IPoint) =>
            query(check).filter(o => hitTest(o, world, view));
        }

        const info: IPickInfo<T> = {
          instances: Array.from(this.isMouseOver.keys()),
          layer: this.layer.id,
          projection: view,
          querySpace,
          screen: [mouse.x, mouse.y],
          world: [world.x, world.y]
        };

        onMouseOut(info);
      }
    }

    // We clear as no instances are over anymore
    this.isMouseOver.clear();
    // We also clear all down elements as the mouse is no longer in proper context for the instances
    // But since the mouse was never actually released, we do not fire an up
    this.isMouseDown.clear();
  }

  /**
   * Handles mouse up gestures for the layer within the provided view
   */
  handleMouseUp(view: IProjection, mouse: IPoint, button: number) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseUp } = this.layer.props;

      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseUp) {
        const world = view.viewToWorld(mouse);
        let hitTest: InstanceHitTest<T>;
        let query: TrackedQuadTree<T>["query"];
        let querySpace;
        let instances: T[] = [];

        if (this.layer.picking.type === PickType.ALL) {
          hitTest = this.layer.picking.hitTest;
          query = this.layer.picking.quadTree.query.bind(
            this.layer.picking.quadTree
          );
          querySpace = (check: Bounds | IPoint) =>
            query(check).filter(o => hitTest(o, world, view));
          instances = query(world).filter(o => hitTest(o, world, view));
        } else if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        const info: IPickInfo<T> = {
          button,
          instances,
          layer: this.layer.id,
          projection: view,
          querySpace,
          screen: [mouse.x, mouse.y],
          world: [world.x, world.y]
        };

        onMouseUp(info);
      }
    }
  }

  /**
   * Mouse move events on the layer will detect when instances have their item newly over or just moved on
   */
  handleMouseMove(view: IProjection, mouse: IPoint) {
    // This handles interactions for PickType ALL layers
    const { onMouseOver, onMouseMove, onMouseOut } = this.layer.props;

    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseOver || onMouseMove || onMouseOut) {
        let info: IPickInfo<T>;
        const world = view.viewToWorld(mouse);
        let hitTest: InstanceHitTest<T>;
        let query: TrackedQuadTree<T>["query"];
        let querySpace;
        let instances: T[] = [];

        if (this.layer.picking.type === PickType.ALL) {
          hitTest = this.layer.picking.hitTest;
          query = this.layer.picking.quadTree.query.bind(
            this.layer.picking.quadTree
          );
          querySpace = (check: Bounds | IPoint) =>
            query(check).filter(o => hitTest(o, world, view));
          instances = query(world).filter(o => hitTest(o, world, view));
        } else if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        // Broadcast the picking info for newly over instances to any of the layers listeners if needed
        if (onMouseOver) {
          const notOverInstances = instances.filter(
            o => !this.isMouseOver.get(o)
          );
          info = {
            instances: notOverInstances,
            layer: this.layer.id,
            projection: view,
            querySpace,
            screen: [mouse.x, mouse.y],
            world: [world.x, world.y]
          };

          if (notOverInstances.length > 0) onMouseOver(info);
        }

        // Broadcast the the picking info for all instances that the mouse moved on
        if (onMouseMove) {
          // This is the pick info object we will broadcast from the layer
          info = {
            instances,
            layer: this.layer.id,
            projection: view,
            querySpace,
            screen: [mouse.x, mouse.y],
            world: [world.x, world.y]
          };

          onMouseMove(info);
        }

        // We take the hovered instances
        const isCurrentlyOver = new Map<T, boolean>();
        instances.forEach(o => isCurrentlyOver.set(o, true));

        // Broadcast the the picking info for all instances that the mouse moved off of
        if (onMouseOut) {
          const noLongerOver = Array.from(this.isMouseOver.keys()).filter(
            o => !isCurrentlyOver.get(o)
          );

          // This is the pick info object we will broadcast from the layer
          info = {
            instances: noLongerOver,
            layer: this.layer.id,
            projection: view,
            querySpace,
            screen: [mouse.x, mouse.y],
            world: [world.x, world.y]
          };

          if (noLongerOver.length > 0) onMouseOut(info);
        }

        // We store the current hovered over items as our over item list for next interaction
        this.isMouseOver = isCurrentlyOver;
      }
    }
  }

  /**
   * Handles click gestures on the layer within a view
   */
  handleMouseClick(view: IProjection, mouse: IPoint, button: number) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseClick } = this.layer.props;

      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseClick) {
        const world = view.viewToWorld(mouse);
        let hitTest: InstanceHitTest<T>;
        let query: TrackedQuadTree<T>["query"];
        let querySpace;
        let instances: T[] = [];

        if (this.layer.picking.type === PickType.ALL) {
          hitTest = this.layer.picking.hitTest;
          query = this.layer.picking.quadTree.query.bind(
            this.layer.picking.quadTree
          );
          querySpace = (check: Bounds | IPoint) =>
            query(check).filter(o => hitTest(o, world, view));
          instances = query(world).filter(o => hitTest(o, world, view));
        } else if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        const info: IPickInfo<T> = {
          button,
          instances,
          layer: this.layer.id,
          projection: view,
          querySpace,
          screen: [mouse.x, mouse.y],
          world: [world.x, world.y]
        };

        onMouseClick(info);
      }
    }
  }

  /**
   * Handles drag gestures for the layer within the view
   */
  handleMouseDrag(_view: IProjection, _mouse: IPoint) {
    // We probably should not broadcast drag events for the sake of instances. Instance dragging should be handled on
    // An instance by instance basis rather than coming from the view's gestures
  }
}
