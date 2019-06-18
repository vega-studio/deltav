import {
  mapGetWithDefault,
  mapInjectDefault
} from "src/util/common-operations";
import {
  IMouseInteraction,
  ISingleTouchInteraction,
  ITouchInteraction
} from "../event-management/types";
import { Instance } from "../instance-provider/instance";
import {
  IColorPickingData,
  IMousePickInfo,
  IProjection,
  ITouchPickInfo,
  PickType
} from "../types";
import { UniformColorDiffProcessor } from "./buffer-management/uniform-buffering/uniform-color-diff-processor";
import { ILayerProps, Layer } from "./layer";

function isColorProcessor<T extends Instance>(
  val: any
): val is UniformColorDiffProcessor<T> {
  return val && val.colorPicking;
}

/**
 * This manages mouse gestures broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 *
 * Summarized: layer-mouse-events processes and filters events for the Views, this processes those events for the layers
 * and their instances.
 */
export class LayerInteractionHandler<
  T extends Instance,
  U extends ILayerProps<T>
> {
  /** This is the color picking information most recently rendered */
  colorPicking?: IColorPickingData;
  /** This tracks the elements that have the mouse currently over them */
  isMouseOver = new Set<T>();
  /** This tracks the elements the mouse was down on */
  isMouseDown = new Set<T>();
  /** This is the layer the interaction handler manages events for */
  layer: Layer<T, U>;

  /** Tracks elements that have a touch over them */
  isTouchOver = new Map<number, Set<T>>();
  isTouchDown = new Map<number, Set<T>>();

  constructor(layer: Layer<T, U>) {
    this.layer = layer;
  }

  /**
   * Retrieves the color picking instance determined for the procedure.
   */
  getColorPickInstance() {
    if (
      this.colorPicking &&
      this.layer.diffManager &&
      isColorProcessor<T>(this.layer.diffManager.processor)
    ) {
      return this.layer.diffManager.processor.colorPicking.uidToInstance.get(
        0xffffff - this.colorPicking.nearestColor
      );
    }

    return null;
  }

  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseOver(_view: IProjection, _interaction: IMouseInteraction) {
    // This is the mouse over for the view itself. We should probably just let the mouse over events handle the interactions
    // With the instances
  }

  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseDown(view: IProjection, interaction: IMouseInteraction) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseDown } = this.layer.props;

      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseDown) {
        const world = view.screenToWorld(interaction.screen.position);
        const instances: T[] = [];

        if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        const info: IMousePickInfo<T> = {
          interaction,
          instances,
          layer: this.layer.id,
          projection: view,
          screen: interaction.screen.position,
          world
        };

        onMouseDown(info);

        // We track all the elements the mouse is currently down on
        this.isMouseDown.clear();
        instances.forEach(o => this.isMouseDown.add(o));
      }
    }
  }

  /**
   * Handles touch events for instances for layers
   */
  handleTouchDown(
    view: IProjection,
    interaction: ITouchInteraction,
    touch: ISingleTouchInteraction
  ) {
    const { onTouchDown, onTouchOver } = this.layer.props;

    // Validate the conditions on the layer justifies having events be processed for the layer
    if (
      !this.layer.picking ||
      this.layer.picking.type === PickType.NONE ||
      (!onTouchDown && !onTouchOver)
    ) {
      return;
    }

    const world = view.screenToWorld(touch.screen.position);
    const instances: T[] = [];

    if (this.layer.picking.type === PickType.SINGLE) {
      // Get the instance for the nearest color
      const instanceForColor = this.getColorPickInstance();

      if (instanceForColor) {
        instances.push(instanceForColor);
      }
    }

    const info: ITouchPickInfo<T> = {
      interaction,
      touch,
      instances,
      layer: this.layer.id,
      projection: view,
      screen: touch.screen.position,
      world
    };

    // Add the instances involved in the touch down to our down state items.
    // Being down also happens to cause the touch to be in an 'over' state as well
    // This is more unique to touch as there is not a cursor following the event before the event happens
    const isTouchDown = mapInjectDefault(
      this.isTouchDown,
      touch.touch.touch.identifier,
      () => new Set()
    );

    const isTouchOver = mapInjectDefault(
      this.isTouchOver,
      touch.touch.touch.identifier,
      () => new Set()
    );

    instances.forEach(instance => {
      isTouchDown.add(instance);
      isTouchOver.add(instance);
    });

    // Broadcast the touch over/down event
    if (onTouchOver) onTouchOver(info);
    if (onTouchDown) onTouchDown(info);
  }

  /**
   * Handles mouse out events for a layer within the view
   */
  handleMouseOut(view: IProjection, interaction: IMouseInteraction) {
    // This will fire an instance mouse out for any over instances in the queue since we left the view
    // Thus no instances shall be considered 'over'
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseOut } = this.layer.props;

      if (onMouseOut) {
        const world = view.screenToWorld(interaction.screen.position);

        const info: IMousePickInfo<T> = {
          interaction,
          instances: Array.from(this.isMouseOver.keys()),
          layer: this.layer.id,
          projection: view,
          screen: interaction.screen.position,
          world
        };

        onMouseOut(info);
      }
    }

    // We clear as no instances are over anymore
    this.isMouseOver.clear();
  }

  /**
   * Handles touch events that have been dragged off of a view
   */
  handleTouchOut(
    view: IProjection,
    interaction: ITouchInteraction,
    touch: ISingleTouchInteraction
  ) {
    const { onTouchOut } = this.layer.props;

    if (
      !this.layer.picking ||
      this.layer.picking.type === PickType.NONE ||
      !onTouchOut
    ) {
      return;
    }

    const world = view.screenToWorld(touch.screen.position);

    const info: ITouchPickInfo<T> = {
      interaction,
      touch,
      instances: Array.from(this.isMouseOver.keys()),
      layer: this.layer.id,
      projection: view,
      screen: touch.screen.position,
      world
    };

    onTouchOut(info);

    // We must clear out ALL touch over state for the touch as we are not even on the view anymore
    this.isTouchOver.delete(touch.touch.touch.identifier);
  }

  /**
   * Handles mouse up gestures for the layer within the provided view
   */
  handleMouseUp(view: IProjection, interaction: IMouseInteraction) {
    const { onMouseUp, onMouseUpOutside } = this.layer.props;

    // Check to ensure the layer is configured to accept the events
    if (
      !this.layer.picking ||
      this.layer.picking.type === PickType.NONE ||
      !onMouseUp
    ) {
      return;
    }

    const world = view.screenToWorld(interaction.screen.position);
    const instances: T[] = [];

    if (this.layer.picking.type === PickType.SINGLE) {
      // Get the instance for the nearest color
      const instanceForColor = this.getColorPickInstance();

      if (instanceForColor) {
        instances.push(instanceForColor);
      }
    }

    let info: IMousePickInfo<T> = {
      interaction,
      instances,
      layer: this.layer.id,
      projection: view,
      screen: interaction.screen.position,
      world
    };

    // Broadcast the mouse up event to the layers
    onMouseUp(info);
    // Now we look to see which of the mouse down instances were NOT in the mouse up instances to detect mouse up
    // outside events
    instances.forEach(instance => this.isMouseDown.delete(instance));
    // If no mouse downs remain, then we simply stop here
    if (this.isMouseDown.size <= 0 || !onMouseUpOutside) return;

    // Otherwise, broadcast a mouse up outside event for all instances remaining
    info = {
      interaction,
      instances: Array.from(this.isMouseDown.values()),
      layer: this.layer.id,
      projection: view,
      screen: interaction.screen.position,
      world
    };

    // Broadcast the mouse up outside event to the layers
    onMouseUpOutside(info);
  }

  /**
   * Handles touch up events that occur over a view
   */
  handleTouchUp(
    view: IProjection,
    interaction: ITouchInteraction,
    touch: ISingleTouchInteraction
  ) {
    const {
      onTouchUp,
      onTouchUpOutside,
      onTouchOut,
      onTouchAllEnd
    } = this.layer.props;

    // Check to ensure the layer is configured to accept the events
    if (
      !this.layer.picking ||
      this.layer.picking.type === PickType.NONE ||
      (!onTouchUp && !onTouchUpOutside && !onTouchOut && !onTouchAllEnd)
    ) {
      return;
    }

    const world = view.screenToWorld(touch.screen.position);
    const instances: T[] = [];

    if (this.layer.picking.type === PickType.SINGLE) {
      // Get the instance for the nearest color
      const instanceForColor = this.getColorPickInstance();

      if (instanceForColor) {
        instances.push(instanceForColor);
      }
    }

    let info: ITouchPickInfo<T> = {
      interaction,
      touch,
      instances,
      layer: this.layer.id,
      projection: view,
      screen: touch.screen.position,
      world
    };

    // Broadcast the touch up event to the layers
    if (onTouchUp) onTouchUp(info);
    // If this is touch down
    const isTouchDown = mapGetWithDefault(
      this.isTouchDown,
      touch.touch.touch.identifier,
      new Set()
    );
    // Now we look to see which of the touch down instances were NOT in the touch up instances to detect touch up
    // outside events
    instances.forEach(instance => isTouchDown.delete(instance));

    // If no touch downs remain, then we simply stop here
    if (isTouchDown.size > 0 && onTouchUpOutside) {
      // Otherwise, broadcast a touch up outside event for all instances remaining
      info = {
        interaction,
        touch,
        instances: Array.from(isTouchDown.values()),
        layer: this.layer.id,
        projection: view,
        screen: touch.screen.position,
        world
      };

      // Broadcast the mouse up outside event to the layers
      onTouchUpOutside(info);
    }

    // Clear the touch down state information
    this.isTouchDown.delete(touch.touch.touch.identifier);

    // If no more touches are considered down anymore, then we have an all end event
    if (this.isTouchDown.size <= 0 && onTouchAllEnd) {
      info = {
        interaction,
        touch,
        instances: [],
        layer: this.layer.id,
        projection: view,
        screen: touch.screen.position,
        world
      };

      onTouchAllEnd(info);
    }
  }

  /**
   * Mouse move events on the layer will detect when instances have their item newly over or just moved on
   */
  handleMouseMove(view: IProjection, interaction: IMouseInteraction) {
    // This handles interactions for PickType ALL layers
    const { onMouseOver, onMouseMove, onMouseOut } = this.layer.props;

    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseOver || onMouseMove || onMouseOut) {
        let info: IMousePickInfo<T>;
        const world = view.screenToWorld(interaction.screen.position);
        const instances: T[] = [];

        if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        // MOUSE OUT
        // First broadcast Mouse out events
        const isCurrentlyOver = new Set<T>();
        instances.forEach(o => isCurrentlyOver.add(o));

        // Broadcast the the picking info for all instances that the mouse moved off of
        if (onMouseOut) {
          const noLongerOver: T[] = [];

          this.isMouseOver.forEach(o => {
            if (!isCurrentlyOver.has(o)) {
              noLongerOver.push(o);
            }
          });

          // This is the pick info object we will broadcast from the layer
          info = {
            interaction,
            instances: noLongerOver,
            layer: this.layer.id,
            projection: view,
            screen: interaction.screen.position,
            world
          };

          if (noLongerOver.length > 0) onMouseOut(info);
        }

        // MOUSE OVER
        // Broadcast the picking info for newly over instances to any of the layers listeners if needed
        if (onMouseOver) {
          const notOverInstances = instances.filter(
            o => !this.isMouseOver.has(o)
          );
          info = {
            interaction,
            instances: notOverInstances,
            layer: this.layer.id,
            projection: view,
            screen: interaction.screen.position,
            world
          };

          if (notOverInstances.length > 0) onMouseOver(info);
        }

        // MOUSE MOVE
        // Broadcast the the picking info for all instances that the mouse moved on
        if (onMouseMove) {
          // This is the pick info object we will broadcast from the layer
          info = {
            interaction,
            instances,
            layer: this.layer.id,
            projection: view,
            screen: interaction.screen.position,
            world
          };

          onMouseMove(info);
        }

        // We store the current hovered over items as our over item list for next interaction
        this.isMouseOver = isCurrentlyOver;
      }
    }
  }

  /**
   * Handles click gestures on the layer within a view
   */
  handleMouseClick(view: IProjection, interaction: IMouseInteraction) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type !== PickType.NONE) {
      const { onMouseClick } = this.layer.props;

      // If we have a listener for either event we should continue to process the event in more detail
      if (onMouseClick) {
        const world = view.screenToWorld(interaction.screen.position);
        const instances: T[] = [];

        if (this.layer.picking.type === PickType.SINGLE) {
          // Get the instance for the nearest color
          const instanceForColor = this.getColorPickInstance();

          if (instanceForColor) {
            instances.push(instanceForColor);
          }
        }

        const info: IMousePickInfo<T> = {
          interaction,
          instances,
          layer: this.layer.id,
          projection: view,
          screen: interaction.screen.position,
          world
        };

        onMouseClick(info);
      }
    }
  }

  /**
   * Handles drag gestures for the layer within the view
   */
  handleMouseDrag(_view: IProjection, _interaction: IMouseInteraction) {
    // We probably should not broadcast drag events for the sake of instances. Instance dragging should be handled on
    // An instance by instance basis rather than coming from the view's gestures
  }
}
