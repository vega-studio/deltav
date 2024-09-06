import { IResolverProvider } from "../use-child-resolver.js";
import { ISceneOptions } from "../../../surface/index.js";
/**
 * Base props required for the component to implement to be a LayerJSX
 */
export interface ISceneBaseJSX extends IResolverProvider<ISceneOptions> {
}
