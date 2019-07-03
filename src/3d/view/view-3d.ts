import { Bounds } from "../../primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Mat4x4, multiply4x4, Vec, Vec2, Vec2Compat, Vec3, Vec3Compat, normalize3 } from "../../util";
import { Camera, CameraProjectionType } from "../../util/camera";

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView2DProps extends IViewProps {
}

/**
 * Type guard to ensure the camera type is orthographic
 */
function isOrthographic(val: Camera): val is Camera {
  return val.projectionType === CameraProjectionType.ORTHOGRAPHIC;
}

/**
 * A View renders a perspective of a scene to a given surface or surfaces. The 3D view system assumes a y-axis
 * up system. The view also assumes the camera is located in the middle of the viewport.
 */
export class View3D<TViewProps extends IView2DProps> extends View<TViewProps> {
  static defaultProps: IView2DProps = {
    key: "",
    camera: new Camera({
      type: CameraProjectionType.PERSPECTIVE,
      width: 100,
      height: 100,
      fov: Math.PI / 2,
      far: 100000,
      near: 1,
    }),
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
   * Maps a coordinate relative to the screen to a 'camera ray direction vector'. A camera ray is a ray that extends
   * from the camera's position through the near plane that goes in the viewing direction away from the camera.
   * This means you get a vector direction that if drawn as a line (camera position + vector direction) would appear as
   * a dot on the screen at the given pixel selected.
   *
   * This can be used to aid in picking 3D objects via the camera or perform ray tracing algorithms.
   */
  screenToWorld(point: Vec2, out?: Vec3): Vec3 {
    const { width, height } = this.viewBounds;
    const { projectionOptions } = this.props.camera;

    if (projectionOptions.type === CameraProjectionType.PERSPECTIVE) {
      const { fov } = projectionOptions;
      let Px, Py;

      if (width > height) {
        const imageAspectRatio = width / height;
        Px = (2 * ((point[0] + 0.5) / width) - 1) * Math.tan(fov / 2 * Math.PI / 180) * imageAspectRatio;
        Py = (1 - 2 * ((point[1] + 0.5) / height) * Math.tan(fov / 2 * Math.PI / 180));
      }

      else {
        const imageAspectRatio = height / width;
        Px = (2 * ((point[0] + 0.5) / width) - 1) * Math.tan(fov / 2 * Math.PI / 180);
        Py = (1 - 2 * ((point[1] + 0.5) / height) * Math.tan(fov / 2 * Math.PI / 180)) * imageAspectRatio;
      }

      let rayDirection: Vec3 = [Px, Py, -1];
      rayDirection = normalize3(rayDirection);

      // TODO: Now we need to have a matrix that will transform this rayDirection to world space (model transform of
      // the camera, then world projection)
    }
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(point: Vec3, out?: Vec2) {
    const viewProjectionMatrix: Mat4x4 = multiply4x4(this.props.camera.projection, this.props.camera.view);
    // Transform world to clipping coordinates
    point3D = viewProjectionMatrix.multiply(point3D);
    int; winX = (int); Math.round((( point3D.getX() + 1 ) / 2.0) *
                                  width );
    //we calculate -point3D.getY() because the screen Y axis is
    //oriented top->down
    int; winY = (int); Math.round((( 1 - point3D.getY() ) / 2.0) *
                                  height );
    return new Point2D(winX, winY);

    return [0, 0] as Vec2;
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
