import { IPoint } from '../primitives/point';
import { IPickInfo, IProjection } from '../types';
import { Instance } from '../util';
import { ILayerProps, Layer, PickType } from './layer';

/**
 * This manages mouse events broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 */
export class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>, V> {
  /** This is the layer the interaction handler manages events for */
  layer: Layer<T, U, V>;

  constructor(layer: Layer<T, U, V>) {
    this.layer = layer;
  }

  handleMouseOver(view: IProjection, mouse: IPoint) {
    // This handles interactions for PickType ALL layers
    if (this.layer.picking && this.layer.picking.type === PickType.ALL) {
      const world = view.viewToWorld(mouse);
      const instances = this.layer.picking.quadTree.queryPoint(world, []);

      // This is the pick info object we will broadcast from the layer
      const info: IPickInfo<T> = {
        instances,
        layer: this.layer.id,
        world: [world.x, world.y],
      };

      // Broadcast the picking info to any of the layers listeners if needed
      const { onMouseOver } = this.layer.props;
      if (onMouseOver) onMouseOver(info);
    }
  }

  handleMouseDown(view: IProjection, mouse: IPoint) {
    // TODO
  }

  handleMouseUp(view: IProjection, mouse: IPoint) {
    // TODO
  }

  handleMouseMove(view: IProjection, mouse: IPoint) {
    // TODO
  }

  handleMouseClick(view: IProjection, mouse: IPoint) {
    // TODO
  }
}
