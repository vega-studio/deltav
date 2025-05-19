import { Instance } from "../../../instance-provider/index.js";
import { ILayerProps, LayerInitializer } from "../../../surface/index.js";
import { IResolverProvider } from "../use-child-resolver.js";

/**
 * Base props required for the component to implement to be a LayerJSX
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILayerBaseJSX<
  TInstance extends Instance = Instance,
  TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
> extends IResolverProvider<LayerInitializer<TInstance, TProps>> {}
