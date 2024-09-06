import { IResolverProvider } from "../use-child-resolver.js";
import { IViewProps, ViewInitializer } from "../../../surface/index.js";
/**
 * Base props required for the component to implement to be a LayerJSX
 */
export interface IViewBaseJSX<TProps extends IViewProps = IViewProps> extends IResolverProvider<ViewInitializer<TProps>> {
}
