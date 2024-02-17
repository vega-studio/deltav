import { ILayerProps, Layer, LayerScene, Surface } from "../../surface";
import { Instance } from "../../instance-provider";
import { IShaderInitialization } from "../../types";

export interface ILayer2DProps<TInstance extends Instance>
  extends ILayerProps<TInstance> {}

/**
 * Base layer for the 2D world layering system. This essentially just requires the Camera2D to be an available
 * property of the Layer2D as well as provide the 2D projection methods to the layers.
 */
export class Layer2D<
  TInstance extends Instance,
  TLayerProps extends ILayer2DProps<TInstance>,
> extends Layer<TInstance, TLayerProps> {
  constructor(surface: Surface, scene: LayerScene, props: TLayerProps) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(surface, scene, props);
  }

  /**
   * Force the world2D methods as the base methods
   */
  baseShaderModules(shaderIO: IShaderInitialization<TInstance>) {
    const modules = super.baseShaderModules(shaderIO);
    modules.vs.push("world2D");

    return modules;
  }
}
