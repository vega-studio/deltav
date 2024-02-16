import { SurfaceJSXType } from "../group-surface-children.js";
import { ISceneOptions } from "../../../surface/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a LayerJSX
 */
export interface ISceneBaseJSX extends IResolverProvider<ISceneOptions> {
  /**
   * DO NOT PASS:
   * Base resource property managed by the system. Do not pass a value to these
   * props as they will be overriden by the system.
   */
  surfaceJSXType: SurfaceJSXType.SCENE;
}
