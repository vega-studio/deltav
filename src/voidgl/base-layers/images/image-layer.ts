import * as Three from 'three';
import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IProjection, IUniform, UniformSize, VertexAttributeSize } from '../../types';
import { ScaleType } from '../types';
import { ImageInstance } from './image-instance';

const { min, max } = Math;

export interface IImageLayerProps extends ILayerProps<ImageInstance> {
  atlas?: string;
}

export interface IImageLayerState {

}

/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class ImageLayer extends Layer<ImageInstance, IImageLayerProps, IImageLayerState> {
  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given image
      boundsAccessor: (image: ImageInstance) => {
        const topLeft = [
          image.x - image.anchor.x,
          image.y - image.anchor.y,
        ];

        return new Bounds({
          height: image.height,
          width: image.width,
          x: topLeft[0],
          y: topLeft[1],
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (image: ImageInstance, point: IPoint, view: IProjection) => {
        // The bounds of the image is in world space, but it does not account for the scale mode of the image.
        // Here, we will apply the scale mode testing to the image
        const maxScale = max(...view.camera.scale);
        const minScale = min(...view.camera.scale);

        // If we scale always then the image stays within it's initial world bounds at all times
        if (image.scaling === ScaleType.ALWAYS) {
          return true;
        }

        // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
        // Image the same size. If the camera zooms out then the bounds === the world bounds.
        else if (image.scaling === ScaleType.BOUND_MAX) {
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          }

          // We are zooming in. The bounds will shrink to keep the image at max font size
          else {
            // The location is within the world, but we reverse project the anchor spread
            const topLeft = view.worldToScreen({
              x: image.x - (image.anchor.x / view.camera.scale[0]),
              y: image.y - (image.anchor.y / view.camera.scale[1]),
            });

            const screenPoint = view.worldToScreen(point);

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: image.height,
              width: image.width,
              x: topLeft.x,
              y: topLeft.y,
            }).containsPoint(screenPoint);
          }
        }

        // If we never allow the image to scale, then the bounds will grow and shrink to counter the effects
        // Of the camera zoom
        else if (image.scaling === ScaleType.NEVER) {
          // The location is within the world, but we reverse project the anchor spread
          const topLeft = view.worldToScreen({
            x: image.x - (image.anchor.x / view.camera.scale[0]),
            y: image.y - (image.anchor.y / view.camera.scale[1]),
          });

          const screenPoint = view.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          return new Bounds({
            height: image.height,
            width: image.width,
            x: topLeft.x,
            y: topLeft.y,
          }).containsPoint(screenPoint);
        }

        return true;
      },
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ImageInstance> {
    const vertexToNormal: {[key: number]: number} = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1,
    };

    const vertexToSide: {[key: number]: number} = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1,
    };

    return {
      fs: require('./image-layer.fs'),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'location',
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.x, o.y],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'anchor',
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.anchor.x, o.anchor.y],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'size',
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.width, o.height],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'depth',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.FOUR,
          name: 'scaling',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.scaling],
        },
        {
          atlas: {
            key: this.props.atlas,
            name: 'imageAtlas',
          },
          block: 2,
          name: 'texture',
          update: (o) => this.resource.request(this, o, o.resource),
        },
        {
          block: 3,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'tint',
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.tint,
        },
      ],
      uniforms: [
        {
          name: 'scaleFactor',
          size: UniformSize.ONE,
          update: (u: IUniform) => [1],
        },
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: 'position',
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
            0,
          ],
        },
      ],
      vertexCount: 6,
      vs: require('./image-layer.vs'),
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh,
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return {
      blending: Three.CustomBlending,
      blendSrc: Three.OneFactor,
      premultipliedAlpha: true,
      transparent: true,
    };
  }
}
