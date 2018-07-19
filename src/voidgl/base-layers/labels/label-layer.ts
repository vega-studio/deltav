import * as Three from 'three';
import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IProjection, IShaderInitialization, UniformSize, VertexAttributeSize } from '../../types';
import { Vec2 } from '../../util';
import { ScaleType } from '../types';
import { LabelInstance } from './label-instance';

export interface ILabelLayerProps<T extends LabelInstance> extends ILayerProps<T> {
  atlas?: string;
}

const { max, min } = Math;

/**
 * This layer displays Labels and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class LabelLayer<T extends LabelInstance, U extends ILabelLayerProps<T>> extends Layer<T, U> {
  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given label
      boundsAccessor: (label: LabelInstance) => {
        const anchor: Vec2 = [label.anchor.x || 0, label.anchor.y || 0];

        const topLeft = [label.x - anchor[0], label.y - anchor[1]];

        return new Bounds({
          height: label.height,
          width: label.width,
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (label: LabelInstance, point: IPoint, view: IProjection) => {
        // The bounds of the label is in world space, but it does not account for the scale mode of the label.
        // Here, we will apply the scale mode testing to the label
        const maxScale = max(...view.camera.scale);
        const minScale = min(...view.camera.scale);

        // If we scale always then the label stays within it's initial world bounds at all times
        if (label.scaling === ScaleType.ALWAYS) {
          return true;
        }

        // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
        // Label the same size. If the camera zooms out then the bounds === the world bounds.
        else if (label.scaling === ScaleType.BOUND_MAX) {
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          }

          // We are zooming in. The bounds will shrink to keep the label at max font size
          else {
            const anchor: Vec2 = [label.anchor.x || 0, label.anchor.y || 0];

            // The location is within the world, but we reverse project the anchor spread
            const topLeft = view.worldToScreen({
              x: label.x - anchor[0] / view.camera.scale[0],
              y: label.y - anchor[1] / view.camera.scale[1]
            });

            const screenPoint = view.worldToScreen(point);

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: label.height,
              width: label.width,
              x: topLeft.x,
              y: topLeft.y
            }).containsPoint(screenPoint);
          }
        }

        // If we never allow the label to scale, then the bounds will grow and shrink to counter the effects
        // Of the camera zoom
        else if (label.scaling === ScaleType.NEVER) {
          const anchor: Vec2 = [label.anchor.x || 0, label.anchor.y || 0];

          // The location is within the world, but we reverse project the anchor spread
          const topLeft = view.worldToScreen({
            x: label.x - anchor[0] / view.camera.scale[0],
            y: label.y - anchor[1] / view.camera.scale[1]
          });

          const screenPoint = view.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          return new Bounds({
            height: label.height,
            width: label.width,
            x: topLeft.x,
            y: topLeft.y
          }).containsPoint(screenPoint);
        }

        return true;
      }
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<LabelInstance> {
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      fs: require("./label-layer.fs"),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: "location",
          size: InstanceAttributeSize.TWO,
          update: o => [o.x, o.y]
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: "anchor",
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: "size",
          size: InstanceAttributeSize.TWO,
          update: o => [o.width, o.height]
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.THREE,
          name: "depth",
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.FOUR,
          name: "scaling",
          size: InstanceAttributeSize.ONE,
          update: o => [o.scaling]
        },
        {
          atlas: {
            key: this.props.atlas || "",
            name: "labelAtlas"
          },
          block: 2,
          name: "texture",
          update: o => this.resource.request(this, o, o.resource)
        },
        {
          block: 3,
          blockIndex: InstanceBlockIndex.ONE,
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          block: 4,
          blockIndex: InstanceBlockIndex.ONE,
          name: "scale",
          size: InstanceAttributeSize.ONE,
          update: o => [o.scale]
        },
        {
          block: 4,
          blockIndex: InstanceBlockIndex.TWO,
          name: "maxScale",
          size: InstanceAttributeSize.ONE,
          update: o => [o.maxScale]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [1]
        }
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
            0
          ]
        }
      ],
      vertexCount: 6,
      vs: require("./label-layer.vs")
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return {
      blending: Three.CustomBlending,
      blendSrc: Three.OneFactor,
      premultipliedAlpha: true,
      transparent: true
    };
  }
}
