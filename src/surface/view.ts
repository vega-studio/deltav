import { BaseProjection } from "../math/base-projection";
import { AbsolutePosition } from "../primitives/absolute-position";
import { Bounds } from "../primitives/bounds";
import { Color, Omit } from "../types";
import { Vec2 } from "../util";
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
 * This specifies a class type that can be used in creating a view with createView
 */
export type IViewConstructionClass<
  TViewProps extends IViewProps
> = IViewConstructable<TViewProps> & { defaultProps: TViewProps };

/**
 * This is a pair of a Class Type and the props to be applied to that class type.
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
 * Defines the input metrics of a view for a scene.
 */
export interface IViewProps extends IdentifyByKeyOptions {
  /**
   * The background color that gets cleared out for this view. Performance is
   * better if this is left clear. Probably better to draw a colored quad instead.
   * This is just convenient.
   */
  background?: Color;
  /**
   * This is the 3D camera used to create a vantage point in the 3D world and project it's viewpoint to the 2d screen.
   */
  camera: Camera;
  /**
   * This sets what buffers get cleared by webgl before the view is drawn in it's space.
   */
  clearFlags?: ClearFlags[];
  /** Helps assert a guaranteed rendering order if needed. Lower numbers render first. */
  order?: number;
  /**
   * This specifies the bounds on the canvas this camera will render to. This let's you render
   * say a little square in the bottom right showing a minimap.
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
   * This is the depth of the view. The higher the depth represents which layer is on top.
   * Zero always represents the default view.
   */
  depth: number = 0;
  /** Last frame time this view was rendered under */
  lastFrameTime: number = 0;
  /** This is the flag to see if a view needs draw */
  needsDraw: boolean = false;
  /**
   * This is a flag for various processes to indicate the view is demanding optimal rendering performance over other processes.
   * This is merely a hinting device and does not guarantee better performance at any given moment.
   */
  optimizeRendering: boolean = false;
  /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
  pixelRatio: number = 1;
  /** The props applied to this view */
  props: TViewProps;
  /** The scene this view is displaying */
  scene: LayerScene;
  /** This establishes the projection methods that can be used to project geometry between the screen and the world */
  projection: BaseProjection<View<TViewProps>>;

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
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   * For default behavior this ensures that the coordinate system has no distortion, orthographic,
   * top left as 0,0 with +y axis pointing down.
   */
  abstract fitViewtoViewport(
    _surfaceDimensions: Bounds<never>,
    viewBounds: Bounds<View<IViewProps>>
  ): void;

  /*
   * This method returns a flag indicating whether or not the view should trigger a redraw.
   * By default, a redraw is triggered (this returns true) when a shallow comparison of the current props
   * and the incoming props are different.
   * This method can be overridden to place custom logic at this point to indicate when redraws should happen.
   *
   * NOTE: This should be considered for redraw logic centered around changes in the view itself.
   * There ARE additional triggers in the system that causes redraws. This method just aids in ensuring
   * necessary redraws take place for view level logic and props.
   */
  shouldDrawView(oldProps: TViewProps, newProps: TViewProps) {
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) return true;
    }

    return false;
  }

  /**
   * Lifecycle: Fires before the props object is updated with the newProps. Allows view to
   * respond to diff changes.
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
  screenBounds = new Bounds<never>({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });

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
  }
}
