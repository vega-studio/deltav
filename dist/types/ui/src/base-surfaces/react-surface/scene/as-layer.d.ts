import { ILayerProps, LayerInitializer } from "../../../surface/index.js";
import { Instance } from "../../../instance-provider/index.js";
import { IResolverProvider } from "../use-child-resolver.js";
/**
 * Base props required for the component to implement to be a LayerJSX
 */
export interface ILayerBaseJSX<TInstance extends Instance = Instance, TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>> extends IResolverProvider<LayerInitializer<TInstance, TProps>> {
}
