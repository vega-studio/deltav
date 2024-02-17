import { BaseResourceOptions } from "../../../resources/index.js";
import { IResolverProvider } from "../use-child-resolver.js";
import { SurfaceJSXType } from "../group-surface-children.js";

/**
 * Base props required for the component to implement to be a ResourceJSX
 */
export interface IResourceJSX extends IResolverProvider<BaseResourceOptions> {
  /**
   * DO NOT PASS:
   * Base resource property managed by the system. Do not pass a value to these
   * props as they will be overriden by the system.
   */
  surfaceJSXType: SurfaceJSXType.RESOURCE;
}
