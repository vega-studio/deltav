import {
  GLSettings,
  RenderBufferOutputTarget,
  RenderTarget,
  Texture,
  WebGLStat
} from "../gl";
import { Instance, InstanceProvider } from "../instance-provider";
import { Vec2 } from "../math";
import { BaseProjection, SimpleProjection } from "../math/base-projection";
import { AbsolutePosition } from "../math/primitives/absolute-position";
import { Bounds } from "../math/primitives/bounds";
import { IRenderTextureResource, ResourceRouter } from "../resources";
import { textureRequest } from "../resources/texture/render-texture-resource-request";
import { Color, FragmentOutputType, isString, Omit } from "../types";
import { Camera } from "../util/camera";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { Layer } from "./layer";
import { LayerScene } from "./layer-scene";

export enum ClearFlags {
  COLOR = 0b0001,
  DEPTH = 0b0010,
  STENCIL = 0b0100
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
export type IViewConstructionClass<
  TViewProps extends IViewProps
> = IViewConstructable<TViewProps> & { defaultProps: TViewProps };

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
  resource: string;
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
      bottom: 0
    }
  });

  return {
    get key() {
      return props.key || "";
    },
    init: [viewClass, keyedProps]
  };
}

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewProps extends IdentifyByKeyOptions {
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
    buffers: Record<number, string | IRenderTextureResource>;
    /**
     * Set to true to include a depth buffer the system will generate for you.
     * Set to a resource id to target an output texture to store the depth
     * buffer. Set to false to not have the depth buffer used or calculated.
     */
    depth: string | boolean;
  };
  /**
   * This specifies the bounds on the canvas this camera will render to. This
   * let's you render say a little square in the bottom right showing a minimap.
   *
   * If this is not specified, the entire canvas will be the viewport.
   */
  viewport: AbsolutePosition;
}

/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export abstract class View<
  TViewProps extends IViewProps
> extends IdentifyByKey {
  static defaultProps: IViewProps = {
    key: "",
    camera: Camera.makeOrthographic(),
    viewport: { left: 0, right: 0, top: 0, bottom: 0 }
  };

  /** End time of animation */
  animationEndTime: number = 0;
  /**
   * This is the depth of the view. The higher the depth represents which layer
   * is on top. Zero always represents the default view.
   */
  depth: number = 0;
  /** Last frame time this view was rendered under */
  lastFrameTime: number = 0;
  /** This is the flag to see if a view needs draw */
  needsDraw: boolean = false;
  /**
   * This is a flag for various processes to indicate the view is demanding
   * optimal rendering performance over other processes. This is merely a
   * hinting device and does not guarantee better performance at any given
   * moment.
   */
  optimizeRendering: boolean = false;
  /**
   * This is set to ensure the projections that happen properly translates the
   * pixel ratio to normal Web coordinates
   */
  pixelRatio: number = 1;
  /**
   * This establishes the projection methods that can be used to project
   * geometry between the screen and the world
   */
  projection: BaseProjection<View<TViewProps>>;
  /** The props applied to this view */
  props: TViewProps;
  /**
   * This is the router that makes it possible to request resources. Our view
   * needs this to be available to aid in creating render targets to output
   * into.
   */
  resource: ResourceRouter;
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

  constructor(scene: LayerScene, props: TViewProps) {
    super(props);
    this.scene = scene;
    // Keep our props within the view
    this.props = Object.assign({}, View.defaultProps || {}, props);
  }

  /**
   * retrieves this view's targets for outputting fragment information. This
   * provides a simple list of the target's keys with their output type.
   */
  getOutputTargets() {
    const { output } = this.props;
    let bufferTargets: ViewOutputTarget[] = [];
    if (!output) return null;

    // A string simply matches the output to the default COLOR information type.
    if (isString(output.buffers)) {
      bufferTargets = [
        {
          outputType: FragmentOutputType.COLOR,
          resource: output.buffers
        }
      ];
    }

    // A Record causes us to pull out the necessary pieces of the outputs and
    // resource keys or strings as the keys.
    else {
      Object.keys(output.buffers).forEach(outputTypeKey => {
        const outputType = Number.parseFloat(outputTypeKey);
        const resource = output.buffers[outputType];

        bufferTargets.push({
          outputType,
          resource: isString(resource) ? resource : resource.key
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
        this.renderTarget.forEach(t => t.dispose());
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
      const fragmentOutputs = layer.shaderIOInfo.fs.get(this);

      if (!fragmentOutputs) {
        continue;
      }

      fragmentOutputs.outputTypes.forEach(type =>
        supportedOutputTypes.add(type)
      );
    }

    // Retrieve the RenderTextures for each buffer target we have specified
    const renderTextures = new Map<number, Texture>();
    const dummyLayer = new Layer(surface, this.scene, {
      key: "",
      data: new InstanceProvider()
    });
    const dummyInstance = new Instance({});
    const bufferTargets = this.getOutputTargets() || [];

    console.log(
      "Supported buffer types our view provides",
      bufferTargets.map(b => b.outputType)
    );
    console.log("Supported output types from our layers", supportedOutputTypes);

    for (let i = 0, iMax = bufferTargets.length; i < iMax; ++i) {
      const bufferTarget = bufferTargets[i];
      if (supportedOutputTypes.has(bufferTarget.outputType)) {
        // Submit our request for the specified resource
        const request = textureRequest({
          key: bufferTarget.resource
        });

        this.resource.request(dummyLayer, dummyInstance, request);
        console.log(
          "Render Target found for output type",
          bufferTarget.outputType,
          request
        );

        if (!request.texture) {
          console.warn(
            "A view has a buffer output target with key:",
            bufferTarget.resource,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createTexture()"
          );
          throw new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }

        renderTextures.set(bufferTarget.outputType, request.texture);
      }
    }

    let checkW: number, checkH: number;
    renderTextures.forEach(tex => {
      if (checkW === void 0 || checkH === void 0) {
        checkW = tex.data?.width || 0;
        checkH = tex.data?.height || 0;
      }

      if (checkW === 0 || checkH === 0) {
        throw new Error(
          "RenderTexture for View can NOT have a width or height of zero."
        );
      }

      if (tex.data?.width !== checkW || tex.data.height !== checkH) {
        throw new Error(
          "When a view has multiple output targets: ALL RenderTextures that a view references MUST have the same dimensions"
        );
      }
    });

    let depthBuffer;

    if (output.depth) {
      // Find the render target resource specified that is intended to store the
      // depth buffer
      if (isString(output.depth)) {
        // Generate our request to retrieve the depth buffer from the manager
        // handling the indicated texture.
        const request = textureRequest({
          key: output.depth
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
      }

      // Otherwise, just create a buffer format for the buffer
      else {
        depthBuffer =
          GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16;
      }
    }

    // Now with our listing of supported types, we create an appropriate
    // RenderTarget or RenderTarget's based on system capabilities. MRT enabled
    // systems can have a single render target that handles multiple targets
    // while non MRT systems will have multiple render targets
    if (WebGLStat.MRT) {
      const colorBuffers: RenderBufferOutputTarget[] = [];
      renderTextures.forEach((tex, type) =>
        colorBuffers.push({
          buffer: tex,
          outputType: type
        })
      );

      this.renderTarget = new RenderTarget({
        buffers: {
          color: colorBuffers,
          depth: depthBuffer
        },
        // Render target texture retention is governed by the resource set up
        // on the surface
        retainTextureTargets: true
      });

      console.log(
        "GENERATED the render target for the view:",
        this.renderTarget
      );
    }

    // Non-MRT makes multiple render targets. One for each output type.
    else {
      throw new Error("MRT for non-MRT systems not supported yet.");
      // const targets: RenderTarget[] = [];
      // const depth = depthBuffer;
      // this.renderTarget = targets;

      // renderTextures.forEach((tex, type) => {
      //   const color = {
      //     buffer: tex,
      //     outputType: type
      //   };

      //   targets.push(
      //     new RenderTarget({
      //       buffers: {
      //         color: color,
      //         depth
      //       },
      //       // Render target texture retention is governed by the resource set up
      //       // on the surface
      //       retainTextureTargets: true
      //     })
      //   );
      // });
    }
  }

  /**
   * This let's the view do anything it needs to be ready for next render. Some
   * tasks this may include is checking if it's render target is still valid.
   * It's buffer outputs can get invalidated for any number of reasons.
   */
  willUseView() {
    const targets = this.getRenderTargets();

    const invalid = targets.some(target =>
      target.getBuffers().some(buffer => {
        if (buffer.buffer instanceof Texture) {
          if (buffer.buffer.disposed) return true;
        }

        return false;
      })
    );

    if (invalid) {
      console.error("REBUILDING VIEW RENDER TARGET");
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
   * NOTE: This should be considered for redraw logic centered around changes in
   * the view itself. There ARE additional triggers in the system that causes
   * redraws. This method just aids in ensuring necessary redraws take place for
   * view level logic and props.
   */
  shouldDrawView(oldProps: TViewProps, newProps: TViewProps) {
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) return true;
    }

    return false;
  }

  /**
   * Lifecycle: Fires before the props object is updated with the newProps.
   * Allows view to respond to diff changes.
   */
  willUpdateProps(_newProps: IViewProps) {
    // No-op for the base behavior
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
      camera: Camera.makeOrthographic()
    });

    this.screenBounds = new Bounds<never>({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  }
}
