import React from "react";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { ILayerBaseJSX } from "./as-layer.js";
import { CustomTag } from "../custom-tag.js";
import {
  Instance,
  InstanceProvider,
} from "../../../instance-provider/index.js";
import { ILayerConstructable, ILayerProps } from "../../../surface/index.js";
import { createLayer } from "../../../util/create-layer.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import {
  IRenderTextureResource,
  isRenderTextureResource,
} from "../../../resources/index.js";
import { SurfaceContext } from "../surface-jsx.js";
import { isDefined } from "../../../util/common-filters.js";

export type LayerConfig<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
> = Omit<TProps, "key" | "data"> & Partial<Pick<TProps, "key" | "data">>;

export interface ILayerJSX<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
  TUse extends IRenderTextureResource = IRenderTextureResource,
> extends Partial<ILayerBaseJSX<TInstance, TProps>> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;
  /** The Layer constructor type we wish to initialize */
  type: ILayerConstructable<TInstance, TProps> & {
    defaultProps: TProps;
  };
  /** Configure the constructed layer via the layer's props */
  config: LayerConfig<TInstance, TProps>;
  /**
   * This provides a means to access the instance provider used by this Layer.
   * When a layer is not explicitly provided an instance provider, it will
   * generate one for itself.
   */
  providerRef?: React.MutableRefObject<InstanceProvider<TInstance> | null>;
  /**
   * This allows resource dependencies to be specified for the Layer that will
   * be necessary to apply to the Layer configuration. This is commonly used
   * when the layer has a texture input. You specify the
   */
  uses?: {
    /** Resource names to use */
    names: string[];
    apply: (
      resources: Record<string, TUse>,
      config: LayerConfig<TInstance, TProps>
    ) => LayerConfig<TInstance, TProps>;
  };
}

export const LayerJSX = <
  TInstance extends Instance = Instance,
  TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
>(
  props: ILayerJSX<TInstance, TProps>
) => {
  const surfaceContext = React.useContext(SurfaceContext);

  useLifecycle({
    async didMount() {
      let config = props.config;
      const uses = props.uses;

      // If the layer is using resources, the layer need to wait on those
      // resources before declaring the layer resource.
      if (uses) {
        await surfaceContext?.resolversReady;
        const resolvedResources: Record<string, IRenderTextureResource> = {};

        const resolvers = uses.names
          .map(async (name) => {
            const resolver = surfaceContext?.resourceResolvers?.get(name);

            if (!resolver) {
              console.error(
                `A layer requested a resource: ${name} but the name identifier was not found in the available resources`
              );
              console.warn(
                "Available resources:",
                Array.from(surfaceContext?.resourceResolvers?.keys() || [])
              );
              return null;
            }

            const resource = await resolver.promise;

            if (!resource) {
              console.error(
                `The Layer requested a resource "${name}", but the resource did not resolve a value`
              );
              return null;
            }

            if (!isRenderTextureResource(resource)) {
              console.error(
                `The Layer requested a resource "${name}", but the resource resolved to a value that is not a render texture resource`
              );
              return null;
            }

            resolvedResources[name] = resource;
          })
          .filter(isDefined);

        await Promise.all(resolvers);

        config = uses.apply(resolvedResources, { ...props.config });
      }

      // Generate the layer object based on the given configuration.
      const layer = createLayer(props.type, {
        key: props.name,
        ...config,
      });
      let provider = layer.init[1].data;

      // We don't want the provider for the layer to be the defaulted static
      // provider for the layer lest all same type layers share the same
      // provider.
      if (provider === layer.init[0].defaultProps.data) {
        provider = new InstanceProvider();
        layer.init[1].data = provider;
      }

      if (props.providerRef && provider instanceof InstanceProvider) {
        props.providerRef.current = provider;
      }

      props.resolver?.resolve(layer);
    },
  });

  return <CustomTag tagName="Layer" {...props} />;
};

LayerJSX.defaultProps = {
  surfaceJSXType: SurfaceJSXType.LAYER,
} as ILayerJSX<any, any>;
