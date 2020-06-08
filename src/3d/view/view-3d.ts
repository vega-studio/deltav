import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Camera, CameraProjectionType, isPerspective } from "../../util/camera";
import { Projection3D } from "./projection-3d";

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView3DProps extends IViewProps {}

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
export class View3D<TViewProps extends IView3DProps> extends View<TViewProps> {
  static defaultProps: IView3DProps = {
    key: "",
    camera: new Camera({
      type: CameraProjectionType.PERSPECTIVE,
      width: 100,
      height: 100,
      fov: Math.PI / 2,
      far: 100000,
      near: 1
    }),
    viewport: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    }
  };

  projection: Projection3D;

  constructor(scene: LayerScene, options: TViewProps) {
    super(scene, options);
    this.projection = new Projection3D();
    this.projection.camera = options.camera;
    this.projection.pixelRatio = this.pixelRatio;
  }

  /**
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   */
  fitViewtoViewport(
    _surfaceDimensions: Bounds<never>,
    viewBounds: Bounds<View<IViewProps>>
  ) {
    if (isPerspective(this.props.camera)) {
      const width = viewBounds.width;
      const height = viewBounds.height;

      const viewport = {
        near: 1,
        far: 100000,
        width,
        height
      };

      const camera = this.props.camera;

      camera.projectionOptions = Object.assign(
        camera.projectionOptions,
        viewport
      );

      camera.update();

      this.projection.pixelRatio = this.pixelRatio;
      this.projection.viewBounds = viewBounds;
      this.projection.viewBounds.d = this;
      this.projection.screenBounds = new Bounds<View<TViewProps>>({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      });
      this.projection.screenBounds.d = this;
    } else if (isOrthographic(this.props.camera)) {
      const width = viewBounds.width;
      const height = viewBounds.height;

      const viewport = {
        near: 1,
        far: 100000,
        left: -width / 2,
        right: width / 2,
        top: height / 2,
        bottom: -height / 2
      };

      const camera = this.props.camera;

      camera.projectionOptions = Object.assign(
        camera.projectionOptions,
        viewport
      );

      camera.update();

      this.projection.pixelRatio = this.pixelRatio;
      this.projection.viewBounds = viewBounds;
      this.projection.viewBounds.d = this;
      this.projection.screenBounds = new Bounds<View<TViewProps>>({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      });
      this.projection.screenBounds.d = this;
    }
  }

  willUpdateProps(newProps: IView3DProps) {
    this.projection.camera = newProps.camera;
  }
}
