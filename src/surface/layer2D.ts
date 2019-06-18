import { Instance } from "src/instance-provider";
import { IShaderInitialization } from "src/types";
import { Controller2D } from "src/util";
import { ILayerProps, Layer } from "./layer";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";

export interface ILayer2DProps<T extends Instance> extends ILayerProps<T> {
  world2D: Controller2D;
}

export class Layer2D<
  T extends Instance,
  U extends ILayer2DProps<T>
> extends Layer<T, U> {
  // props: U;
  world2D: Controller2D;

  constructor(surface: Surface, scene: LayerScene, props: ILayer2DProps<T>) {
    super(surface, scene, props);
    this.world2D = props.world2D;
  }

  baseShaderModules(
    shaderIO: IShaderInitialization<T>
  ): { fs: string[]; vs: string[] } {
    const base = super.baseShaderModules(shaderIO);
    base.vs.push("world2D");
    return {
      vs: base.vs,
      fs: base.fs
    };
  }
}
