import { EventManager } from "../../../event-management/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a EventManagerJSX
 */
export interface IEventManagerJSX extends IResolverProvider<EventManager> {}
