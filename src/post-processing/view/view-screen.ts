import { Bounds } from "../../math/primitives/bounds";
import { add3 } from "../../math/vector";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Camera, CameraProjectionType } from "../../util/camera";
import { ProjectionScreen } from "./projection-screen";

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewScreenProps extends IViewProps {}

/**s
 * Type guard to ensure the camera type is orthographic
 */
function isOrthographic(val: Camera): val is Camera {
  return val.projectionType === CameraProjectionType.ORTHOGRAPHIC;
}

/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export class ViewScreen<TViewProps extends IViewScreenProps> extends View<
  TViewProps
> {
  static defaultProps: IViewScreenProps = {
    key: "",
    camera: Camera.makeOrthographic(),
    viewport: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    }
  };

  /** These are the projection methods specific to rendering with this 2D system. */
  projection: ProjectionScreen = new ProjectionScreen();

  constructor(scene: LayerScene, options: TViewProps) {
    super(scene, options);
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

      const scaleX = 1 / this.pixelRatio;
      const scaleY = 1 / this.pixelRatio;
      const camera = this.props.camera;

      camera.projectionOptions = Object.assign(
        camera.projectionOptions,
        viewport
      );
      camera.position = [
        viewBounds.width / (2.0 * this.pixelRatio),
        viewBounds.height / (2.0 * this.pixelRatio),
        camera.position[2]
      ];
      camera.scale = [scaleX, -scaleY, 1.0];
      // Always face the -z direction
      camera.lookAt(add3(camera.position, [0, 0, -1]), [0, 1, 0]);
      camera.update();

      this.projection.viewBounds = viewBounds;
      viewBounds.d = this;
      this.projection.screenBounds = new Bounds<View<TViewProps>>({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio
      });
      this.screenBounds.d = this;
    } else if (!isOrthographic(this.props.camera)) {
      console.warn("ViewScreen does not support non-orthographic cameras.");
    }
  }

  willUpdateProps(_newProps: IViewScreenProps) {
    // NOOP
  }
}
