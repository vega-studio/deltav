import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  Instance,
  InstanceProvider,
} from "../../../instance-provider/index.js";
import {
  IRenderTextureResource,
  isRenderTextureResource,
} from "../../../resources/index.js";
import { ILayerConstructable, ILayerProps } from "../../../surface/index.js";
import { isDefined } from "../../../util/common-filters.js";
import { createLayer } from "../../../util/create-layer.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { SurfaceContext } from "../surface-jsx.js";
import { ILayerBaseJSX } from "./as-layer.js";

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
   *
   * This ALSO is a means to deliver a provider to the layer! If the ref has a
   * provider populated within it, the Layer will use that provider instead of
   * generating one. Delivering the provider via the ref is the same as setting
   * the Layers config.data property.
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
  const layerRef = React.useRef<ReturnType<
    typeof createLayer<TInstance, TProps>
  > | null>(null);

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

      // Determine the provider that is provided to the layer. This is an
      // opportunity for the providerRef to deliver the provider which makes the
      // Ref capable of either receiving the Layer's created provider OR let the
      // ref specify the provider. This helps harmonize the interface better
      // where the ref is the primary method of interaction with the layer's
      // provider. The altrnative would be having to submit the provider via the
      // config.data property, which could be confusing to a developer.
      let provider = props.providerRef?.current || layer.init[1].data;

      // We don't want the provider for the layer to be the defaulted static
      // provider for the layer lest all same type layers share the same
      // provider.
      if (provider === layer.init[0].defaultProps.data) {
        provider = new InstanceProvider();
      }

      // Make sure the provider we intend for the layer is applied to it's
      // initialization properties.
      layer.init[1].data = provider;

      if (props.providerRef && provider instanceof InstanceProvider) {
        props.providerRef.current = provider;
      }

      layerRef.current = layer;
      props.resolver?.resolve(layer);

      return () => {
        // Indicate the layer is ready for disposal when the component unmounts.
        surfaceContext?.disposeLayer?.(layer);
      };
    },
  });

  // On props chane, make sure the pipeline updates so the underlying layer will
  // trigger a props update.
  React.useEffect(() => {
    if (!layerRef.current?.init[1]) return;

    layerRef.current.init[1] = Object.assign(
      {},
      layerRef.current.init[1] || {},
      props.config
    );

    surfaceContext?.updatePipeline?.();
  }, [...Object.values(props), ...Object.values(props.config)]);

  return <CustomTag tagName="Layer" {...props} />;
};

LayerJSX.surfaceJSXType = SurfaceJSXType.LAYER;
