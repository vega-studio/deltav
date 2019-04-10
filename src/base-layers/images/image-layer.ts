import { InstanceProvider } from "../../instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { IProjection, InstanceDiffType } from "../../types";
import { divide2, IAutoEasingMethod, subtract2, Vec, Vec2 } from "../../util";
import { ScaleMode } from "../types";
import { ImageInstance } from "./image-instance";
import { LayerInitializer, createLayer } from "src/surface";
import { ImageRenderLayer } from "./ImageRenderLayer";

const { min, max } = Math;

export interface IImageLayerProps<T extends ImageInstance>
  extends ILayerProps<T> {
  atlas?: string;
  animate?: {
    tint?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
    size?: IAutoEasingMethod<Vec>;
  };
  resourceKey?: string;
  scaleMode?: ScaleMode;
}

/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class ImageLayer<
  T extends ImageInstance,
  U extends IImageLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IImageLayerProps<any> = {
    key: "",
    data: new InstanceProvider<ImageInstance>(),
    scene: "default"
  };

  imageProvider = new InstanceProvider<ImageInstance>();

  propertyIds: { [key: string]: number } | undefined;

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given image
      boundsAccessor: (image: ImageInstance) => {
        const anchorEffect: Vec2 = [0, 0];

        if (image.anchor) {
          anchorEffect[0] = image.anchor.x || 0;
          anchorEffect[1] = image.anchor.y || 0;
        }

        const topLeft = subtract2(image.position, anchorEffect);

        return new Bounds({
          height: image.height,
          width: image.width,
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (image: ImageInstance, point: Vec2, view: IProjection) => {
        // The bounds of the image is in world space, but it does not account for the scale mode of the image.
        // Here, we will apply the scale mode testing to the image
        const maxScale = max(...view.camera.scale);
        const minScale = min(...view.camera.scale);

        // If we scale always then the image stays within it's initial world bounds at all times
        if (image.scaling === ScaleMode.ALWAYS) {
          return true;
        } else if (image.scaling === ScaleMode.BOUND_MAX) {
          // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
          // Image the same size. If the camera zooms out then the bounds === the world bounds.
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          } else {
            // We are zooming in. The bounds will shrink to keep the image at max font size
            // The location is within the world, but we reverse project the anchor spread
            const anchorEffect: Vec2 = [0, 0];

            if (image.anchor) {
              anchorEffect[0] = image.anchor.x || 0;
              anchorEffect[1] = image.anchor.y || 0;
            }

            const topLeft = subtract2(
              image.position,
              divide2(anchorEffect, view.camera.scale)
            );

            const screenPoint = view.worldToScreen(point);

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: image.height,
              width: image.width,
              x: topLeft[0],
              y: topLeft[1]
            }).containsPoint(screenPoint);
          }
        } else if (image.scaling === ScaleMode.NEVER) {
          // If we never allow the image to scale, then the bounds will grow and shrink to counter the effects
          // Of the camera zoom
          // The location is within the world, but we reverse project the anchor spread
          const anchorEffect: Vec2 = [0, 0];

          if (image.anchor) {
            anchorEffect[0] = image.anchor.x || 0;
            anchorEffect[1] = image.anchor.y || 0;
          }

          const topLeft = view.worldToScreen(
            subtract2(image.position, divide2(anchorEffect, view.camera.scale))
          );

          const screenPoint = view.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          const bounds = new Bounds({
            height: image.height,
            width: image.width,
            x: topLeft[0],
            y: topLeft[1]
          });

          return bounds.containsPoint(screenPoint);
        }

        return true;
      }
    };
  }

  childLayers(): LayerInitializer[] {
    return [
      createLayer(ImageRenderLayer, {
        animate: this.props.animate,
        data: this.imageProvider,
        key: `${this.id}.images`,
        resourceKey: this.props.resourceKey,
        scene: this.props.scene,
        scaleMode: this.props.scaleMode || ScaleMode.BOUND_MAX
      })
    ];
  }

  draw() {
    const changes = this.resolveChanges();
    if (changes.length <= 0) return;

    if (!this.propertyIds) {
      const instance = changes[0][0];
      this.propertyIds = this.getInstanceObservableIds(instance, [
        "active",
        "tint",
        "depth",
        "height",
        "width",
        "position",
        "scaling",
        "source"
      ]);
    }

    const { active: activeId } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];
      switch (diffType) {
        case InstanceDiffType.CHANGE:
          if (changed[activeId] !== undefined) {
            if (instance.active) {
              console.warn("instance active");
              this.imageProvider.add(instance);
            }
          }
          break;
      }
    }
  }

  initShader() {
    return null;
  }

  willUpdateProps(newProps: U) {
    // Scale mode change changes the shader needs of the underlying glyphs
    if (newProps.scaleMode !== this.props.scaleMode) {
      this.rebuildLayer();
    }

    if (newProps.resourceKey !== this.props.resourceKey) {
      this.needsViewDrawn = true;
    }
  }
}
