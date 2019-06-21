import { Instance } from "../instance-provider";
import { ILayerProps, Layer } from "../surface";
import { Controller2D } from "./controller-2d";

export interface ILayer2DProps<TInstance extends Instance> extends ILayerProps<TInstance> {
  /** The controller for manipulating the 2d layering system */
  world2D: Controller2D;
}

/**
 * Base layer for the 2D world layering system.
 */
export class Layer2D<TInstance extends Instance, UProps extends ILayerProps<TInstance>> extends Layer<TInstance, UProps> {
}
