import { EventManager } from "../../../event-management/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResolverProvider } from "../use-child-resolver.js";
/**
 * Base props required for the component to implement to be a EventManagerJSX
 */
export interface IEventManagerJSX extends IResolverProvider<EventManager> {
  /**
   * DO NOT PASS:
   * Base resource property managed by the system. Do not pass a value to these
   * props as they will be overriden by the system.
   */
  surfaceJSXType: SurfaceJSXType.EVENT_MANAGER;
}
