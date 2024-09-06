import { BaseResourceOptions } from "../../../resources/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a ResourceJSX
 */
export interface IResourceJSX extends IResolverProvider<BaseResourceOptions> {}
