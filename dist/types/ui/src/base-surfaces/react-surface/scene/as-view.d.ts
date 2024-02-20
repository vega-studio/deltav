import { IResolverProvider } from "../use-child-resolver.js";
import { IViewProps, ViewInitializer } from "../../../surface/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
/**
 * Base props required for the component to implement to be a LayerJSX
 */
export interface IViewBaseJSX<TProps extends IViewProps = IViewProps> extends IResolverProvider<ViewInitializer<TProps>> {
    /**
     * DO NOT PASS:
     * Base resource property managed by the system. Do not pass a value to these
     * props as they will be overriden by the system.
     */
    surfaceJSXType: SurfaceJSXType.VIEW;
}
