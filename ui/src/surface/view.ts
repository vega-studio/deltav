import { ColorBuffer } from "../gl/color-buffer.js";
import {
  GLSettings,
  GLState,
  type MaterialSettings,
  RenderBufferOutputTarget,
  RenderTarget,
  Texture,
  WebGLStat,
} from "../gl/index.js";
import { Instance, InstanceProvider } from "../instance-provider/index.js";
import { BaseProjection, SimpleProjection } from "../math/base-projection.js";
import { type AbsolutePosition, Vec2 } from "../math/index.js";
import { Bounds } from "../math/primitives/bounds.js";
import { BaseResourceOptions } from "../resources/base-resource-manager.js";
import {
  colorBufferRequest,
  IColorBufferResource,
  isColorBufferResource,
} from "../resources/color-buffer/index.js";
import { ResourceRouter } from "../resources/resource-router.js";
import {
  IRenderTextureResource,
  isRenderTextureResource,
} from "../resources/texture/render-texture.js";
import { textureRequest } from "../resources/texture/render-texture-resource-request.js";
import {
  Color,
  FragmentOutputType,
  type FrameMetrics,
  Omit,
} from "../types.js";
import { Camera } from "../util/camera.js";
import {
  IdentifyByKey,
  IdentifyByKeyOptions,
} from "../util/identify-by-key.js";
import { Layer } from "./layer.js";
import { LayerScene } from "./layer-scene.js";

/**
 * Specify which buffer should be cleared before the view is drawn.
 */
export enum ClearFlags {
  COLOR = 0b0001,
  DEPTH = 0b0010,
  STENCIL = 0b0100,
}

/**
 * Specifies when the view should be redrawn. This allows for hard limiting the
 * number of redraws the view will perform or hard trigger forced redraws when
 * the system seems to not be optimizing correctly.
 *
 * This is paired with a general value property to indicate parameters
 * associated with the optimization.
 */
export enum ViewDrawMode {
  /**
   * Redraw a specific number of frames.
   *
   * value is the number of frames that will be redrawn.
   */
  FRAME_COUNT,
  /**
   * Draw, but skip the specified number of frames.
   *
   * value is the number of frames that will be skipped.
   */
  FRAME_SKIP,
  /**
   * Redraw up to a specific timestamp then stops.
   *
   * value is the timestamp that will stop the redraws, there will ALWAYS be a
   * final redraw indicating the final timestamp if the previous frame was
   * slightly before the timestamp.
   */
  UP_TO_TIMESTAMP_INCLUSIVE,
  /**
   * Redraw up to a specific timestamp then stops.
   *
   * value is the timestamp that will stop the redraws, this will only have the
   * final rendering that was able to complete before the timestamp occurred. If
   * there is a hiccup that causes a significant gap from previous rendering and
   * the indicated timestamp, this will still not render and just leave the view
   * at the final rendering it was able to complete.
   */
  UP_TO_TIMESTAMP_EXCLUSIVE,
  /**
   * Only draw when the props change
   */
  ON_PROPS_CHANGE,
  /**
   * Only draw when the trigger function returns true
   */
  ON_TRIGGER,
  /**
   * DEFAULT: Always redraw the view.
   */
  ALWAYS,
  /** Never redraw the view. */
  NEVER,
}

/**
 * A type to describe the constructor of a View class.
 */
export interface IViewConstructable<TViewProps extends IViewProps> {
  new (scene: LayerScene, props: TViewProps): View<TViewProps>;
}

/**
 * This specifies a class type that can be used in creating a view with
 * createView
 */
export type IViewConstructionClass<TViewProps extends IViewProps> =
  IViewConstructable<TViewProps> & { defaultProps: TViewProps };

/**
 * This is a pair of a Class Type and the props to be applied to that class
 * type.
 */
export type ViewInitializer<TViewProps extends IViewProps> = {
  key: string;
  init: [IViewConstructionClass<TViewProps>, IViewProps];
};

/**
 * This describes a target resource for the view to output into.
 */
export type ViewOutputTarget = {
  /**
   * The form of information this output will provide. This is mostly an
   * arbitrary number to help make associations between an output target and the
   * type of information a layer can provide.
   */
  outputType: FragmentOutputType | number;
  /** The resource key that the output will target */
  resource: BaseResourceOptions;
};

/**
 * Used for reactive view generation and updates.
 */
export function createView<TViewProps extends IViewProps>(
  viewClass: IViewConstructable<TViewProps> & { defaultProps: TViewProps },
  props: Omit<TViewProps, "key" | "viewport"> &
    Partial<Pick<TViewProps, "key" | "viewport">>
): ViewInitializer<TViewProps> {
  const keyedProps = Object.assign(props, {
    key: props.key || "",
    viewport: props.viewport || {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  });

  return {
    get key() {
      return props.key || "";
    },
    init: [viewClass, keyedProps],
  };
}

/**
 * A type to describe the output buffers of a view. This is a Map of
 * FragmentOutputType (or custom value number that aligns with your FS mappings)
 * to a target resource to render to. A target of undefined is the screen as the
 * target.
 */
export type ViewOutputBuffers = Record<
  number,
  IRenderTextureResource | IColorBufferResource | undefined
>;

/**
 * A type to describe the output buffers of a view that will be blitted to
 * output buffers. The key should be a FragmentOutputType (or custom value
 * number that aligns with your FS mappings) and should align with the keys
 * provided to the view output to align which buffers get blitted to which
 * targets.
 */
export type BlitOutputBuffers = Record<
  number,
  IRenderTextureResource | IColorBufferResource | undefined
>;

/**
 * A type to describe a target resource for the depth buffer. If a boolean is
 * provided, the depth buffer will be generated by the system or completely
 * excluded if false.
 */
export type ViewDepthBuffer =
  | IRenderTextureResource
  | IColorBufferResource
  | boolean;

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewProps extends IdentifyByKeyOptions {
  /**
   * If this view is created as a part of a chain, this will be the parent view
   * that specified the chain. This is only used by the system.
   */
  parent?: View<IViewProps>;
  /**
   * The background color that gets cleared out for this view. Performance is
   * better if this is left clear. Probably better to draw a colored quad
   * instead. This is just convenient.
   */
  background?: Color;
  /**
   * This is the 3D camera used to create a vantage point in the 3D world and
   * project it's viewpoint to the 2d screen.
   */
  camera: Camera;
  /**
   * This sets what buffers get cleared by webgl before the view is drawn in
   * it's space.
   */
  clearFlags?: ClearFlags[];
  /**
   * Helps assert a guaranteed rendering order if needed. Lower numbers render
   * first.
   */
  order?: number;
  /**
   * These are material settings that will be guaranteed at the time of
   * rendering this view. This overrides any material settings that would be
   * present on the layer.
   */
  materialSettings?: Omit<MaterialSettings, "uniforms" | "uniformBuffers">;

  /**
   * Excluding this property means the view will render to the screen. Only
   * include this if you have a targetted resource to take in what you want to
   * render.
   *
   * This lets you target resources based on their key for where you want to
   * render the output of the view to. If you just specify a key, it will assume
   * it is rendering to the target with COLOR information as a default.
   *
   * If you specify multiple targets with outputType definitions, then the
   * system will look for those information types in the layer renderings and
   * match those render targets to the outputs of the layer. If the layer has
   * nothing to provide for the outputTypes defined, then the layer won't render
   * anything at all to any of the outputs.
   */
  output?: {
    /**
     * Specify output targets for the color buffers this view wants to write to.
     * These should be targets specifying resource keys and provide outputTypes
     * to match information potentially provided by the layers.
     */
    buffers: ViewOutputBuffers;
    /**
     * Set to true to include a depth buffer the system will generate for you.
     * Set to a resource id to target an output texture to store the depth
     * buffer. Set to false to not have the depth buffer used or calculated.
     */
    depth: ViewDepthBuffer;
    /**
     * This is an optional blit target that will take the framebuffer with the
     * result of this view and blit it to the target texture. This is useful for
     * getting the results of a ColorBuffer as a texture (color buffers are useful
     * for antialiasing techniques and other niche situations).
     */
    blit?: { color?: BlitOutputBuffers; depth?: IRenderTextureResource };
  };
  /**
   * This specifies the bounds on the canvas this camera will render to. This
   * let's you render say a little square in the bottom right showing a minimap.
   *
   * If this is not specified, the entire canvas will be the viewport.
   */
  viewport: AbsolutePosition;
  /**
   * This helps resolve scaling differences between a View rendering to an
   * offscreen target, which is then rendered the screen. This is commonly
   * associated with the render target being a scaled version of the screen,
   * then rendered to the screen.
   */
  screenScale?: Vec2;
  /**
   * If provided, this will manually set the pixel ratio of the view. THis is
   * used to help adjust for differing render targets that may not directly
   * render to the screen but rather in scaled modes.
   */
  pixelRatio?: number;

  /**
   * This allows for additional views to be configured but as a rendering chain
   * instead of multiple views. Each chained view will be rendered in the order
   * they are provided, only ONE per draw of the surface (the wrapping view is
   * first, then the chained views come next in the order they appear in the
   * list). Each chained view will be rendered in isolation: meaning only one of
   * the views will be rendered at a time.
   *
   * Each chain configuration is a Partial because it will inherit the
   * properties of the primary view and override those properties with the
   * provided values.
   *
   * A chain currently can not chain as that type of abstraction currently has
   * no thought out purpose.
   */
  chain?: Partial<Omit<IViewProps, "chain">>[];

  /**
   * If true, the view will be redrawn every frame. If a number, the view will
   * be redrawn every n frames. If a Date, the view will be redrawn up to the
   * specified time.
   */
  drawMode?: {
    mode: ViewDrawMode;
    value?: number;
    trigger?: (frameMetrics: FrameMetrics) => boolean;
  };

  /**
   * This is a hook to allow gl state changes JUST BEFORE drawing a layer. This
   * allows for view specific tweaks to how a lyer gets drawn which is a common
   * occurrence in many rendering pipelines.
   */
  glState?(glState: GLState, layerId: string): void;
}

/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export abstract class View<
  TViewProps extends IViewProps,
> extends IdentifyByKey {
  static defaultProps: IViewProps = {
    key: "",
    camera: Camera.makeOrthographic(),
    viewport: { left: 0, right: 0, top: 0, bottom: 0 },
  };

  /** End time of animation */
  animationEndTime = 0;
  /**
   * This is the depth of the view. The higher the depth represents which layer
   * is on top. Zero always represents the default view.
   */
  depth = 0;
  /** Last frame time this view was rendered under */
  lastFrameTime = 0;
  /** This is the flag to see if a view needs draw */
  needsDraw = false;
  /**
   * This is a flag for various processes to indicate the view is demanding
   * optimal rendering performance over other processes. This is merely a
   * hinting device and does not guarantee better performance at any given
   * moment.
   */
  optimizeRendering = false;
  /**
   * This is set to ensure the projections that happen properly translates the
   * pixel ratio to normal Web coordinates
   */
  get pixelRatio() {
    return this.props.pixelRatio ?? this._pixelRatio;
  }

  set pixelRatio(val: number) {
    this._pixelRatio = val;
  }

  private _pixelRatio = 1;
  /**
   * This establishes the projection methods that can be used to project
   * geometry between the screen and the world
   */
  projection!: BaseProjection<View<TViewProps>>;
  /** The props applied to this view */
  props: TViewProps;
  /** The previous frames props for this view */
  previousProps?: TViewProps;
  /**
   * This is the router that makes it possible to request resources. Our view
   * needs this to be available to aid in creating render targets to output
   * into.
   */
  resource!: ResourceRouter;
  /**
   * If this is set, then this view is outputting its rendering somewhere that
   * is not the direct screen buffer.
   */
  renderTarget?: RenderTarget;
  /** The scene this view is displaying */
  scene: LayerScene;

  get screenBounds() {
    return this.projection.screenBounds;
  }

  set screenBounds(val: Bounds<View<TViewProps>>) {
    this.projection.screenBounds = val;
  }

  get viewBounds() {
    return this.projection.viewBounds;
  }

  set viewBounds(val: Bounds<View<TViewProps>>) {
    this.projection.viewBounds = val;
  }

  /** Retrieves the clearflag prop assigned to the view and provides a default */
  get clearFlags() {
    return this.props.clearFlags || [];
  }

  /** Retrieves the order prop assigned to the view and provides a default */
  get order() {
    return this.props.order || 0;
  }

  /**
   * This contains information pertinent to the View's draw mode so the view
   * can properly determine if it should be rendered or not.
   */
  drawModeInfo = {
    startFrame: 0,
    toFrame: 0,
    tillTimestamp: 0,
  };

  constructor(scene: LayerScene, props: TViewProps) {
    super(props);
    this.scene = scene;
    // Keep our props within the view
    this.props = Object.assign({}, View.defaultProps || {}, props);
  }

  /**
   * Retrieves this view's targets for outputting fragment information. This
   * provides a simple list of the target's keys with their output type.
   */
  getOutputTargets() {
    const { output } = this.props;
    let bufferTargets: ViewOutputTarget[] = [];
    if (!output) return null;

    // A string simply matches the output to the default COLOR information type.
    if (
      isRenderTextureResource(output.buffers) ||
      isColorBufferResource(output.buffers)
    ) {
      bufferTargets = [
        {
          outputType: FragmentOutputType.COLOR,
          resource: output.buffers,
        },
      ];
    }

    // A Record causes us to pull out the necessary pieces of the outputs and
    // resource keys or strings as the keys.
    else {
      Object.keys(output.buffers).forEach((outputTypeKey) => {
        const outputType = Number.parseFloat(outputTypeKey);
        const resource = output.buffers[outputType];
        if (!resource) return;

        bufferTargets.push({
          outputType,
          resource,
        });
      });
    }

    return bufferTargets;
  }

  /**
   * Retrieves this view's targets for blitting the outputs of the view to blit
   * buffer targets.
   */
  private getBlitOutputTargets() {
    const { output } = this.props;
    let bufferTargets: ViewOutputTarget[] = [];
    if (!output) return null;
    const blit = output.blit;
    if (!blit) return null;
    const colorBuffers = blit.color;
    if (!colorBuffers) return null;

    // A string simply matches the output to the default COLOR information type.
    if (
      isRenderTextureResource(colorBuffers) ||
      isColorBufferResource(colorBuffers)
    ) {
      bufferTargets = [
        {
          outputType: FragmentOutputType.COLOR,
          resource: colorBuffers,
        },
      ];
    }

    // A Record causes us to pull out the necessary pieces of the outputs and
    // resource keys or strings as the keys.
    else {
      Object.keys(colorBuffers).forEach((outputTypeKey) => {
        const outputType = Number.parseFloat(outputTypeKey);
        const resource = colorBuffers[outputType];
        if (!resource) return;

        bufferTargets.push({
          outputType,
          resource,
        });
      });
    }

    return bufferTargets;
  }

  /**
   * The view can have one or multiple render targets. This helps by always
   * returning a list containing all of the render targets. Returns an empty
   * list if there is no render target associated with the view.
   */
  getRenderTargets() {
    if (!this.renderTarget) return [];

    return [this.renderTarget];
  }

  private requestBufferResources(
    bufferTargets: ViewOutputTarget[],
    supportedOutputTypes: Set<number>,
    dummyLayer: Layer<any, any>,
    dummyInstance: Instance,
    noTexture: (target: ViewOutputTarget) => void,
    noColorBuffer: (target: ViewOutputTarget) => void
  ) {
    const renderBuffers = new Map<number, Texture | ColorBuffer>();

    for (let i = 0, iMax = bufferTargets.length; i < iMax; ++i) {
      const bufferTarget = bufferTargets[i];
      const resource = bufferTarget.resource;

      if (supportedOutputTypes.has(bufferTarget.outputType)) {
        if (isRenderTextureResource(resource)) {
          // Submit our request for the specified resource
          const request = textureRequest({
            key: bufferTarget.resource.key,
          });

          this.resource.request(dummyLayer, dummyInstance, request);

          if (!request.texture) {
            noTexture(bufferTarget);
            return renderBuffers;
          }

          renderBuffers.set(bufferTarget.outputType, request.texture);
        } else {
          const request = colorBufferRequest({
            key: bufferTarget.resource.key,
          });

          this.resource.request(dummyLayer, dummyInstance, request);

          if (!request.colorBuffer) {
            noColorBuffer(bufferTarget);
            return renderBuffers;
          }

          renderBuffers.set(bufferTarget.outputType, request.colorBuffer);
        }
      }
    }

    return renderBuffers;
  }

  /**
   * This generates the render target needed to handle the output configuration
   * specified by the props and the layer configuration.
   *
   * This is called by the system and should never need to be called externally.
   */
  createRenderTarget() {
    // TODO: We should NOT blow away our previous render target without first
    // seeing if the existing render target is sufficient to handle our
    // potentially new configuration.
    // Clear out the previous target
    if (this.renderTarget) {
      if (Array.isArray(this.renderTarget)) {
        this.renderTarget.forEach((t) => t.dispose());
      } else {
        this.renderTarget.dispose();
      }
    }

    const { output } = this.props;
    const surface = this.scene.surface;

    // No output specified means we're just rendering to the screen so all of
    // the outputType hullabaloo is moot.
    if (!output || !surface) return;

    // We analyze the fragment shaders the layers have determined can provide
    // for this view for the indicated output types. Essentially, we use this
    // information to determine if all the layers provided can NOT provide for
    // specific outputTypes. We only create our RenderTarget based on what our
    // layers are capable of handling.
    const supportedOutputTypes = new Set<number>();

    for (let i = 0, iMax = this.scene.layers.length; i < iMax; ++i) {
      const layer = this.scene.layers[i];
      const fragmentOutputs = layer.shaderIOInfo.fs?.get(this);

      if (!fragmentOutputs) {
        continue;
      }

      fragmentOutputs.outputTypes.forEach((type) =>
        supportedOutputTypes.add(type)
      );
    }

    // Retrieve the RenderTextures for each buffer target we have specified
    const dummyLayer = new Layer(surface, this.scene, {
      key: "",
      data: new InstanceProvider(),
    });
    const dummyInstance = new Instance({});
    const bufferTargets = this.getOutputTargets() || [];

    const renderBuffers = this.requestBufferResources(
      bufferTargets,
      supportedOutputTypes,
      dummyLayer,
      dummyInstance,
      (target) => {
        console.warn(
          "A view has a RenderTexture output target with key:",
          target.resource.key,
          "however, no RenderTexture was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key",
          "Also ensure the resource is made via createTexture()"
        );
        throw new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      },
      (target) => {
        console.warn(
          "A view has a ColorBuffer output target with key:",
          target.resource.key,
          "however, no ColorBuffer was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key"
        );
        throw new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      }
    );

    // Perform validations on the buffers
    let checkW: number, checkH: number;
    renderBuffers?.forEach((resource) => {
      if (resource instanceof Texture) {
        if (checkW === void 0 || checkH === void 0) {
          checkW = resource.data?.width || 0;
          checkH = resource.data?.height || 0;
        }

        if (checkW === 0 || checkH === 0) {
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        }

        if (
          resource.data?.width !== checkW ||
          resource.data.height !== checkH
        ) {
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
        }
      } else {
        if (checkW === void 0 || checkH === void 0) {
          checkW = resource.size[0] || 0;
          checkH = resource.size[1] || 0;
        }

        if (checkW === 0 || checkH === 0) {
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        }

        if (resource.size[0] !== checkW || resource.size[1] !== checkH) {
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
        }
      }
    });

    let depthBuffer;

    if (output.depth) {
      // Find the render target resource specified that is intended to store the
      // depth buffer
      if (isRenderTextureResource(output.depth)) {
        // Generate our request to retrieve the depth buffer from the manager
        // handling the indicated texture.
        const request = textureRequest({
          key: output.depth.key,
        });

        this.resource.request(dummyLayer, dummyInstance, request);

        if (!request.texture) {
          console.warn(
            "A view has a depth buffer output target with key:",
            output.depth,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createTexture()"
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }

        depthBuffer = request.texture;
      } else if (isColorBufferResource(output.depth)) {
        // Generate our request to retrieve the depth buffer from the manager
        // handling the indicated texture.
        const request = colorBufferRequest({
          key: output.depth.key,
        });

        this.resource.request(dummyLayer, dummyInstance, request);

        if (!request.colorBuffer) {
          console.warn(
            "A view has a depth buffer output target with key:",
            output.depth.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createColorBuffer()"
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }

        depthBuffer = request.colorBuffer;
      }

      // Otherwise, just create a buffer format for the buffer
      else {
        depthBuffer =
          GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16;
      }
    }

    // Fetch the resources needed for the blit target
    const blitDepth: { depth?: Texture } = {};
    let blitBuffers: Map<number, Texture | ColorBuffer> = new Map();

    // If we have a blit target, we need to request the resources for it
    if (this.props.output?.blit) {
      const blitTargets = this.getBlitOutputTargets() || [];
      blitBuffers = this.requestBufferResources(
        blitTargets,
        supportedOutputTypes,
        dummyLayer,
        dummyInstance,
        (target) => {
          console.warn(
            "A view has a RenderTexture output blit target with key:",
            target.resource.key,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        },
        (target) => {
          console.warn(
            "A view has a ColorBuffer output blit target with key:",
            target.resource.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }
      );

      if (this.props.output.blit.depth) {
        const request = textureRequest({
          key: this.props.output.blit.depth.key,
        });

        this.resource.request(dummyLayer, dummyInstance, request);

        if (!request.texture) {
          console.warn(
            "A view has a blit depth target with key:",
            this.props.output.blit.depth.key,
            "however, no RenderTexture was found for the key."
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }

        blitDepth.depth = request.texture;
      }
    }

    // Now with our listing of supported types, we create an appropriate
    // RenderTarget or RenderTarget's based on system capabilities. MRT enabled
    // systems can have a single render target that handles multiple targets
    if (WebGLStat.MRT) {
      const colorBufferOutputs: RenderBufferOutputTarget[] = [];
      renderBuffers.forEach((tex, type) =>
        colorBufferOutputs.push({
          buffer: tex,
          outputType: type,
        })
      );

      const blitBufferOutputs: RenderBufferOutputTarget[] = [];
      blitBuffers.forEach((tex, type) =>
        blitBufferOutputs.push({
          buffer: tex,
          outputType: type,
        })
      );

      this.renderTarget = new RenderTarget({
        buffers: {
          color: colorBufferOutputs,
          depth: depthBuffer,
          blit:
            blitBufferOutputs.length > 0 || blitDepth.depth
              ? {
                  color:
                    blitBufferOutputs.length > 0 ? blitBufferOutputs : void 0,
                  depth: blitDepth.depth ? blitDepth.depth : void 0,
                }
              : void 0,
        },
        // Render target texture retention is governed by the resource set up
        // on the surface
        retainTextureTargets: true,
      });
    }

    // Non-MRT makes multiple render targets. One for each output type.
    else {
      throw new Error("MRT for non-MRT systems not supported yet.");
    }
  }

  /**
   * Clean out the render targets we created
   */
  destroy() {
    if (this.renderTarget) {
      if (Array.isArray(this.renderTarget)) {
        this.renderTarget.forEach((t) => t.dispose());
      } else {
        this.renderTarget.dispose();
      }
    }
  }

  /**
   * This let's the view do anything it needs to be ready for next render. Some
   * tasks this may include is checking if it's render target is still valid.
   * It's buffer outputs can get invalidated for any number of reasons.
   */
  willUseView() {
    const targets = this.getRenderTargets();

    if (this.props.screenScale) {
      this.projection.screenScale = this.props.screenScale;
    }

    const invalid = targets.some((target) =>
      target.getBuffers().some((buffer) => {
        if (buffer.buffer.destroyed) return true;
        return false;
      })
    );

    if (invalid) {
      this.createRenderTarget();
    }
  }

  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs. For default behavior this ensures that the coordinate
   * system has no distortion, orthographic, top left as 0,0 with +y axis
   * pointing down.
   */
  abstract fitViewtoViewport(
    _surfaceDimensions: Bounds<never>,
    viewBounds: Bounds<View<IViewProps>>
  ): void;

  /*
   * This method returns a flag indicating whether or not the view should
   * trigger a redraw. By default, a redraw is triggered (this returns true)
   * when a shallow comparison of the current props and the incoming props are
   * different. This method can be overridden to place custom logic at this
   * point to indicate when redraws should happen.
   *
   * This is also where the view's drawMode is evaluated to determine if it is
   * time to redraw.
   */
  shouldDrawView(frameMetrics: FrameMetrics) {
    let shouldDraw = false;
    const newProps = this.props;
    const oldProps = this.previousProps ?? this.props;

    const drawModeChange =
      !this.previousProps ||
      newProps.drawMode?.mode !== oldProps.drawMode?.mode ||
      newProps.drawMode?.value !== oldProps.drawMode?.value ||
      newProps.drawMode?.trigger !== oldProps.drawMode?.trigger;
    const drawMode = newProps.drawMode?.mode ?? ViewDrawMode.ALWAYS;

    // Initialize draw mode info if changes have happened.
    if (drawModeChange) {
      switch (drawMode) {
        case ViewDrawMode.FRAME_COUNT:
          this.drawModeInfo.toFrame =
            frameMetrics.currentFrame + (newProps.drawMode?.value || 0);
          break;
        case ViewDrawMode.FRAME_SKIP:
          this.drawModeInfo.startFrame = frameMetrics.currentFrame;
          break;
        case ViewDrawMode.UP_TO_TIMESTAMP_INCLUSIVE:
        case ViewDrawMode.UP_TO_TIMESTAMP_EXCLUSIVE:
          this.drawModeInfo.tillTimestamp = newProps.drawMode?.value || 0;
          break;
        case ViewDrawMode.ALWAYS:
        case ViewDrawMode.NEVER:
        case ViewDrawMode.ON_PROPS_CHANGE:
        default:
          break;
      }
    }

    // Analyze the draw mode and determine if this view is needing to be
    // redrawn.
    switch (drawMode) {
      case ViewDrawMode.FRAME_COUNT:
        shouldDraw = frameMetrics.currentFrame <= this.drawModeInfo.toFrame;
        break;
      case ViewDrawMode.FRAME_SKIP:
        shouldDraw =
          (frameMetrics.currentFrame - this.drawModeInfo.startFrame) %
            (newProps.drawMode?.value || 1) ===
          0;
        break;
      case ViewDrawMode.UP_TO_TIMESTAMP_INCLUSIVE:
        shouldDraw = this.lastFrameTime <= this.drawModeInfo.tillTimestamp;
        break;
      case ViewDrawMode.UP_TO_TIMESTAMP_EXCLUSIVE:
        shouldDraw = frameMetrics.currentTime < this.drawModeInfo.tillTimestamp;
        break;
      case ViewDrawMode.ALWAYS:
        shouldDraw = true;
        break;
      case ViewDrawMode.NEVER:
        shouldDraw = false;
        break;
      case ViewDrawMode.ON_TRIGGER:
        shouldDraw = newProps.drawMode?.trigger?.(frameMetrics) ?? false;
        break;
      case ViewDrawMode.ON_PROPS_CHANGE:
        for (const key in newProps) {
          if (newProps[key] !== oldProps[key]) {
            shouldDraw = true;
            break;
          }
        }
        break;
    }

    return shouldDraw;
  }

  /**
   * Lifecycle: Fires before the props object is updated with the newProps.
   * Allows view to respond to diff changes.
   */
  willUpdateProps(_newProps: IViewProps) {
    this.previousProps = this.props;
  }

  /**
   * Lifecycle: Executes after props have been updated with new contents
   */
  didUpdateProps() {
    // No-op for the base behavior
  }
}

/**
 * A view that does not view anything.
 * Useful as a placeholder view to not cause null or undefined values.
 */
export class NoView extends View<IViewProps> {
  projection = new SimpleProjection();

  screenToWorld(_point: Vec2, _out?: Vec2): Vec2 {
    return [0, 0];
  }

  worldToScreen(_point: Vec2, _out?: Vec2): Vec2 {
    return [0, 0];
  }

  viewToWorld(_point: Vec2, _out?: Vec2): Vec2 {
    return [0, 0];
  }

  worldToView(_point: Vec2, _out?: Vec2): Vec2 {
    return [0, 0];
  }

  fitViewtoViewport(
    screenBounds: Bounds<never>,
    _viewBounds: Bounds<View<IViewProps>>
  ) {
    /** noop */
    this.screenBounds = screenBounds;
  }

  constructor() {
    super(new LayerScene(undefined, { key: "error", layers: [], views: [] }), {
      key: "error",
      viewport: {},
      camera: Camera.makeOrthographic(),
    });

    this.screenBounds = new Bounds<never>({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  }
}
