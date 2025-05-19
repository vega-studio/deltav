import { ISceneOptions } from "../../../surface/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a LayerJSX
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISceneBaseJSX extends IResolverProvider<ISceneOptions> {}
