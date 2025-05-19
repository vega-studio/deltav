import { BaseResourceOptions } from "../../../resources/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a ResourceJSX
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IResourceJSX extends IResolverProvider<BaseResourceOptions> {}
