import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { isString } from "../../../../../util/types.js";
import { isColorBufferResource } from "../../../resources/color-buffer/color-buffer-resource.js";
import {
  BaseResourceOptions,
  type IRenderTextureResource,
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

type ViewJSXOutput = {
  /**
   * Specify output targets for the render/color buffers this view wants to write to.
   * Use the name of the Resource that will be used to be written to.
   */
  buffers: Record<number, string | undefined>;
  /**
   * Set to true to include a depth buffer the system will generate for you.
   * Use the name of the Resource to use it if you wish to target an output
   * target texture.
   */
  depth: string | boolean;
  /**
   * Specify a render target to blit the current framebuffer to.
   */
  blit?: { color?: Record<number, string | undefined>; depth?: string };
};

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
  config: Omit<TProps, "key" | "viewport" | "output" | "chain"> &
    Partial<Pick<TProps, "key" | "viewport">> & {
      output?: undefined;
      chain?: undefined;
    };
  /**
   * An output configuration that handles the JSX pattern where we use refs
   * to pass the values around to each other. Specify an array to create a view
   * chain for rendering to different targets.
   */
  output?: ViewJSXOutput | ViewJSXOutput[];
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

async function bufferRecordToViewOutputBuffers<TProps extends IViewProps>(
  buffers: Record<number, string | undefined>,
  props: IViewJSX<TProps>,
  surfaceContext: ISurfaceContext
) {
  const outputBuffers: ViewOutputBuffers = {};

  const resourceResolvers = Object.entries(buffers)
    .map(
      ([key, name]):
        | [
            number,
            (
              | PromiseResolver<BaseResourceOptions | null>
              | PromiseResolver<undefined>
            ),
            string | undefined,
          ]
        | null => {
        if (name === void 0) {
          const resolver = new PromiseResolver<undefined>();
          return [Number.parseInt(key), resolver, void 0];
        }

        const resolver = getResourceResolverForName(
          props.name,
          surfaceContext,
          name || ""
        );

        if (!resolver) {
          console.warn("View props", props);
          return null;
        }

        return [Number.parseInt(key), resolver, name];
      }
    )
    .filter(isDefined);

  // Wait till all of the resources are available for the view and map those
  // resources to our output buffers
  await Promise.all(
    resourceResolvers.map(async (r) => {
      const { 0: outputBufferTarget, 1: resolver, 2: name } = r;
      const resource = await resolver.promise;
      if (name === void 0) {
        outputBuffers[outputBufferTarget] = void 0;
      } else if (isRenderTextureResource(resource)) {
        outputBuffers[outputBufferTarget] = resource;
      } else if (isColorBufferResource(resource)) {
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

  return outputBuffers;
}

async function requestBuffers<TProps extends IViewProps = IViewProps>(
  requestedOutputBuffer: ViewJSXOutput,
  props: IViewJSX<TProps>,
  surfaceContext: ISurfaceContext
) {
  const requestedOutput = requestedOutputBuffer.buffers;
  const outputBuffers: ViewOutputBuffers =
    await bufferRecordToViewOutputBuffers(
      requestedOutput,
      props,
      surfaceContext
    );

  // Do the resource check and await for the depth buffer as well
  let outputDepth: ViewDepthBuffer = true;

  const requestedDepth = requestedOutputBuffer.depth;
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

  // Do the resource check and await for the blit outputs as well.
  const outputBlit: {
    color?: ViewOutputBuffers;
    depth?: IRenderTextureResource;
  } = {};
  const requestedBlit = requestedOutputBuffer.blit;

  if (requestedBlit?.color) {
    const blitBuffers = await bufferRecordToViewOutputBuffers(
      requestedBlit.color,
      props,
      surfaceContext
    );

    outputBlit.color = blitBuffers;
  }

  if (isString(requestedBlit?.depth)) {
    const resolver = getResourceResolverForName(
      props.name,
      surfaceContext,
      requestedBlit.depth
    );

    if (!resolver) {
      console.warn("View props", props);
      outputBlit.depth = void 0;
    } else {
      const resource = await resolver.promise;

      if (isRenderTextureResource(resource)) outputBlit.depth = resource;
      else {
        console.error(
          `A View "${props.name}" requested a depth blit buffer for the resource with name: ${requestedBlit.depth} but the resource indicated is not a valid output target type.`,
          "Ensure the resource is a RenderTextureResource"
        );
        console.warn("View props", props);
      }
    }
  }

  return {
    buffers: outputBuffers,
    depth: outputDepth,
    blit: outputBlit?.color || outputBlit?.depth ? outputBlit : void 0,
  };
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
      // We need to easily access resource resolvers so we wait for them to be
      // ready.
      await surfaceContext?.resolversReady;

      if (!surfaceContext) {
        console.error("No surface context found");
        return;
      }

      // Loop through our output buffers and map them over to the resolvers for
      // the indicated resource name
      let requestedOutputs: {
        buffers: Record<number, string | undefined>;
        depth: string | boolean;
        blit?: { color?: Record<number, string | undefined>; depth?: string };
      }[] = [];

      if (props.output && !Array.isArray(props.output)) {
        requestedOutputs = [props.output];
      } else if (props.output) {
        requestedOutputs = props.output;
      }

      // Wait for all buffer resources to be ready for every target specified
      const allBuffers = await Promise.all(
        requestedOutputs.map((reqestedOutput) =>
          requestBuffers(reqestedOutput, props, surfaceContext)
        )
      );

      const chainBuffers = allBuffers.slice(1);

      // Generate the view object based on the given configuration.
      const view = createView(props.type, {
        key: props.name,
        ...props.config,
        // First buffer is the primary view we create
        output: props.output
          ? {
              buffers: allBuffers[0].buffers,
              depth: allBuffers[0].depth,
              blit: allBuffers[0].blit,
            }
          : void 0,

        // Additional outputs will map to chaining in the view.
        chain:
          chainBuffers.length > 0
            ? chainBuffers.map((buffer) => ({
                output: {
                  buffers: buffer.buffers,
                  depth: buffer.depth,
                  blit: buffer.blit,
                },
              }))
            : undefined,
      } as Omit<TProps, "key" | "viewport"> &
        Partial<Pick<TProps, "key" | "viewport">>);

      props.resolver?.resolve(view);
    },
  });

  return <CustomTag tagName="View" {...props} />;
};

ViewJSX.surfaceJSXType = SurfaceJSXType.VIEW;
