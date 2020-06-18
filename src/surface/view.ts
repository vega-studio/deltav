import { RenderTarget } from "../gl";
import { Vec2 } from "../math";
import { BaseProjection, SimpleProjection } from "../math/base-projection";
import { AbsolutePosition } from "../math/primitives/absolute-position";
import { Bounds } from "../math/primitives/bounds";
import { Color, isString, Omit } from "../types";
import { Camera } from "../util/camera";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
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
 * This is a listing of Output information styles.
 *
 * NOTE: Information styles are merely suggestions of information types. It does
 * NOT guarantee any specific type of data. These are merely flags to aid in
 * wiring available layer outputs to output render targets. You could
 * theoretically use arbitrary numbers to match the two together, it is
 * recommended to utilize labeled enums though for readability.
 */
export enum ViewOutputInformationType {
  /**
   * This is the most common information output style. It provides a color per
   * fragment
   */
  COLOR = 0,
  /**
   * This indicates it will provide a depth value per fragment
   */
  DEPTH = 1,
  /**
   * This indicates it will provide eye-space normal information per fragment
   */
  NORMAL,
  /**
   * This indicates it will provide eye-space position information per fragment
   */
  POSITION,
  /**
   * This indicates it will provide Lighting information
   */
  LIGHTS,
  /**
   * This indicates it will provide Lighting information
   */
  LIGHTS2,
  /**
   * This indicates it will provide Lighting information
   */
  LIGHTS3,
  /**
   * This indicates it will provide Alpha information
   */
  ALPHA,
  /**
   * This indicates it will provide Beta information
   */
  BETA,
  /**
   * This indicates it will provide Gamma information
   */
  GAMMA,
  /**
   * This indicates it will provide Delta information
   */
  DELTA,
  /**
   * This indicates it will provide Coefficient information
   */
  COEFFICIENT1,
  /**
   * This indicates it will provide Coefficient information
   */
  COEFFICIENT2,
  /**
   * This indicates it will provide Coefficient information
   */
  COEFFICIENT3,
  /**
   * This indicates it will provide Coefficient information
   */
  COEFFICIENT4,
  /**
   * This indicates it will provide Angular information
   */
  ANGLE1,
  /**
   * This indicates it will provide Angular information
   */
  ANGLE2,
  /**
   * This indicates it will provide Angular information
   */
  ANGLE3,
  /**
   * This indicates it will provide Angular information
   */
  ANGLE4,
  /**
   * This is the most common information output style. It provides an
   * alternative color per fragment
   */
  COLOR2,
  /**
   * This is the most common information output style. It provides an
   * alternative color per fragment
   */
  COLOR3,
  /**
   * This is the most common information output style. It provides an
   * alternative color per fragment
   */
  COLOR4
}

/**
 * This describes a target resource for the view to output into.
 */
export type ViewOutputTarget = {
  /**
   * The form of information this output will provide. This is mostly an
   * arbitrary number to help make associations between an output target and the
   * type of information a layer can provide.
   */
  outputType: ViewOutputInformationType | number;
  /** The resource key that the output will target */
  resource: string;
};

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
  output?: string | ViewOutputTarget[];
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
  /** The props applied to this view */
  props: TViewProps;
  /** The scene this view is displaying */
  scene: LayerScene;
  /**
   * This establishes the projection methods that can be used to project
   * geometry between the screen and the world
   */
  projection: BaseProjection<View<TViewProps>>;
  /**
   * If this is set, then this view is outputting its rendering somewhere that
   * is not the direct screen buffer.
   */
  outputTarget?: RenderTarget;

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
   * This generates the render target needed to handle the output configuration
   * specified by the props and the layer configuration.
   */
  createRenderTarget() {
    if (this.outputTarget) this.outputTarget.dispose();
    const { output } = this.props;
    if (!output) return;

    for (let i = 0, iMax = this.scene.layers.length; i < iMax; ++i) {
      const layer = this.scene.layers[i];
      const shaders = layer.shaderIOInfo.material.fragmentShader;

      // If this output is merely a string, then the layer provides a single
      // fragment output type that will be inferred to output a COLOR style of
      // information.
      if (isString(shaders)) {
        shaders;
      }
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
