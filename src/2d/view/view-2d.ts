import { Bounds } from "../../primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Vec2 } from "../../util";
import { Camera, CameraProjectionType } from "../../util/camera";
import { Camera2D } from "./camera-2d";

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView2DProps extends IViewProps {
  /** Redefine the camera applied to this view to ensure it's a 2D camera. */
  camera: Camera2D;
}

/**
 * Type guard to ensure the camera type is orthographic
 */
function isOrthographic(val: Camera): val is Camera {
  return val.projectionType === CameraProjectionType.ORTHOGRAPHIC;
}

/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export class View2D<TViewProps extends IView2DProps> extends View<TViewProps> {
  static defaultProps: IView2DProps = {
    key: "",
    camera: new Camera2D(),
    viewport: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    }
  };

  constructor(scene: LayerScene, options: TViewProps) {
    super(scene, options);
  }

  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  screenToWorld(point: Vec2, out?: Vec2) {
    const view = this.screenToView(point);

    const world = out || [0, 0];
    world[0] =
      (view[0] -
        this.props.camera.control2D.offset[0] * this.props.camera.scale2D[0]) /
      this.props.camera.scale2D[0];
    world[1] =
      (view[1] -
        this.props.camera.control2D.offset[1] * this.props.camera.scale2D[1]) /
      this.props.camera.scale2D[1];

    return world;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(point: Vec2, out?: Vec2) {
    const screen: Vec2 = [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      (point[0] * this.props.camera.scale2D[0] +
        this.props.camera.control2D.offset[0] * this.props.camera.scale2D[0]) *
      this.pixelRatio;
    screen[1] =
      (point[1] * this.props.camera.scale2D[1] +
        this.props.camera.control2D.offset[1] * this.props.camera.scale2D[1]) *
      this.pixelRatio;

    // Convert from view to screen space
    return this.viewToScreen(screen, out);
  }

  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(point: Vec2, out?: Vec2) {
    const world = out || [0, 0];

    const screen = point;
    world[0] =
      (screen[0] -
        this.props.camera.control2D.offset[0] * this.props.camera.scale2D[0]) /
      this.props.camera.scale2D[0];
    world[1] =
      (screen[1] -
        this.props.camera.control2D.offset[1] * this.props.camera.scale2D[1]) /
      this.props.camera.scale2D[1];

    return world;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(point: Vec2, out?: Vec2) {
    const screen = out || [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      point[0] * this.props.camera.scale2D[0] +
      this.props.camera.control2D.offset[0] * this.props.camera.scale2D[0];
    screen[1] =
      point[1] * this.props.camera.scale2D[1] +
      this.props.camera.control2D.offset[1] * this.props.camera.scale2D[1];

    return screen;
  }

  /**
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   * For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic,
   * top left as 0,0 with +y axis pointing down.
   */
  fitViewtoViewport(
    _surfaceDimensions: Bounds<never>,
    viewBounds: Bounds<View<IViewProps>>
  ) {
    if (isOrthographic(this.props.camera)) {
      const width = viewBounds.width;
      const height = viewBounds.height;

      const viewport = {
        bottom: -height / 2,
        far: 10000000,
        left: -width / 2,
        near: -100,
        right: width / 2,
        top: height / 2
      };

      const scaleX = this.pixelRatio;
      const scaleY = this.pixelRatio;
      const camera = this.props.camera;

      camera.projectionOptions = Object.assign(
        camera.projectionOptions,
        viewport
      );
      camera.position = [
        -viewBounds.width / 2.0,
        viewBounds.height / 2.0,
        camera.position[2]
      ];
      camera.scale = [scaleX, -scaleY, 1.0];
      camera.update();

      this.viewBounds = viewBounds;
      this.viewBounds.d = this;
      this.screenBounds = new Bounds<View<TViewProps>>({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio
      });
      this.screenBounds.d = this;
    } else if (!isOrthographic(this.props.camera)) {
      console.warn("View2D does not support non-orthographic cameras yet.");
    }
  }
}
