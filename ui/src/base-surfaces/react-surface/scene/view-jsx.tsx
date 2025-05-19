import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { isString } from "../../../../../util/types.js";
import { isColorBufferResource } from "../../../resources/color-buffer/color-buffer-resource.js";
import {
  BaseResourceOptions,
  isRenderTextureResource,
} from "../../../resources/index.js";
import {
  createView,
  IViewConstructable,
  IViewProps,
  ViewDepthBuffer,
  ViewOutputBuffers,
} from "../../../surface/index.js";
import { isDefined } from "../../../util/index.js";
import { PromiseResolver } from "../../../util/promise-resolver.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { ISurfaceContext, SurfaceContext } from "../surface-jsx.js";
import { IViewBaseJSX } from "./as-view.js";

export interface IViewJSX<TProps extends IViewProps>
  extends Partial<IViewBaseJSX<TProps>> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;
  /** The View constructor type we wish to initialize */
  type: IViewConstructable<TProps> & { defaultProps: TProps };
  /** Configure the constructed layer via the layer's props */
  config: Omit<TProps, "key" | "viewport"> &
    Partial<Pick<TProps, "key" | "viewport">>;
  /**
   * An output configuration that handles the JSX pattern where we use refs
   * to pass the values around to each other.
   */
  output?: {
    /**
     * Specify output targets for the color buffers this view wants to write to.
     * Use the name of the Resource to use it.
     */
    buffers: Record<number, string>;
    /**
     * Set to true to include a depth buffer the system will generate for you.
     * Use the name of the Resource to use it if you wish to target an output
     * target texture.
     */
    depth: string | boolean;
  };
}

export type IPartialViewJSX<TProps extends IViewProps> = Partial<
  Omit<IViewJSX<TProps>, "config">
> & {
  config?: Partial<IViewJSX<TProps>["config"]>;
};

function getResourceResolverForName(
  viewName: string | undefined,
  ctx: ISurfaceContext | undefined,
  name: string
) {
  const resolver = ctx?.resourceResolvers?.get(name);

  if (!resolver) {
    console.error(
      `A View "${viewName}" requested a resource: ${name} but the name identifier was not found in the available resources`
    );
    console.warn(
      "Available resources:",
      Array.from(ctx?.resourceResolvers?.keys() || [])
    );
    return null;
  }

  return resolver;
}

/**
 * Provides a View to be used by a scene
 */
export const ViewJSX = <TProps extends IViewProps = IViewProps>(
  props: IViewJSX<TProps>
) => {
  const surfaceContext = React.useContext(SurfaceContext);

  useLifecycle({
    async didMount() {
      // Some validation
      if (props.config.output && !props.output) {
        console.warn(
          "Do NOT use the output property in the config. Use the output property on the props of the JSX element"
        );
      }

      // We need to easily access resource resolvers so we wait for them to be
      // ready.
      await surfaceContext?.resolversReady;

      // Loop through our output buffers and map them over to the resolvers for
      // the indicated resource name
      const requestedOutput = props.output?.buffers || {};
      const resourceResolvers = Object.entries(requestedOutput)
        .map(([key, name]) => {
          const resolver = getResourceResolverForName(
            props.name,
            surfaceContext,
            name
          );

          if (!resolver) {
            console.warn("View props", props);
            return null;
          }

          return [Number.parseInt(key), resolver, name] as [
            number,
            PromiseResolver<BaseResourceOptions | null>,
            string,
          ];
        })
        .filter(isDefined);

      const outputBuffers: ViewOutputBuffers = {};

      // Wait till all of the resources are available for the view and map those
      // resources to our output buffers
      await Promise.all(
        resourceResolvers.map(async (r) => {
          const resource = await r[1].promise;
          if (isRenderTextureResource(resource)) outputBuffers[r[0]] = resource;
          else if (isColorBufferResource(resource)) {
            outputBuffers[r[0]] = resource;
          } else {
            console.error(
              `A View "${props.name}" requested an output buffer for the resource with name: ${r[2]} but the resource indicated is not a valid output target type.`,
              "Ensure the resource is a RenderTextureResource or ColorBufferResource"
            );
            console.warn("View props", props);
          }
        })
      );

      // Do the resource check and await for the depth buffer as well
      let outputDepth: ViewDepthBuffer = true;

      const requestedDepth = props.output?.depth;
      if (isString(requestedDepth)) {
        const resolver = getResourceResolverForName(
          props.name,
          surfaceContext,
          requestedDepth
        );

        if (!resolver) {
          console.warn("View props", props);
          outputDepth = false;
        } else {
          const resource = await resolver.promise;

          if (isRenderTextureResource(resource)) outputDepth = resource;
          else if (isColorBufferResource(resource)) outputDepth = resource;
          else {
            console.error(
              `A View "${props.name}" requested a depth buffer for the resource with name: ${requestedDepth} but the resource indicated is not a valid output target type.`,
              "Ensure the resource is a RenderTextureResource or ColorBufferResource"
            );
            console.warn("View props", props);
          }
        }
      } else if (isDefined(requestedDepth)) {
        outputDepth = requestedDepth;
      }

      // Generate the view object based on the given configuration.
      const view = createView(props.type, {
        key: props.name,
        ...props.config,
        output: props.output
          ? {
              buffers: outputBuffers,
              depth: outputDepth,
            }
          : void 0,
      });

      props.resolver?.resolve(view);
    },
  });

  return <CustomTag tagName="View" {...props} />;
};

ViewJSX.surfaceJSXType = SurfaceJSXType.VIEW;
