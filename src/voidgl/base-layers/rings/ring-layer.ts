import * as Three from 'three';
import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, Layer } from '../../surface/layer';
import {
  IMaterialOptions,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IProjection,
  IShaderInitialization,
  IUniform,
  UniformSize,
  VertexAttributeSize,
} from '../../types';
import { RingInstance } from './ring-instance';
const { max } = Math;

export interface IRingLayerProps<T extends RingInstance> extends ILayerProps<T> {
  /** This sets a scaling factor for the circle's radius */
  scaleFactor?(): number;
}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class RingLayer<T extends RingInstance, U extends IRingLayerProps<T>> extends Layer<T, U> {
  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor: (ring: RingInstance) => new Bounds({
        height: ring.radius * 2,
        width: ring.radius * 2,
        x: ring.x - ring.radius,
        y: ring.y - ring.radius,
      }),

      // Provide a precise hit test for the ring
      hitTest: (ring: RingInstance, point: IPoint, view: IProjection) => {
        const r = ring.radius / max(...view.camera.scale);
        const delta = [
          point.x - ring.x,
          point.y - ring.y,
        ];

        return (delta[0] * delta[0] + delta[1] * delta[1]) < (r * r);
      },
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<RingInstance> {
    const scaleFactor = this.props.scaleFactor || (() => 1);

    const vertexToNormal: {[key: number]: number} = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1,
    };

    const vertexToSide: {[key: number]: number} = {
      0: -1,
      1: -1,
      2: -1,
      3: 1,
      4: 1,
      5: 1,
    };

    return {
      fs: require('./ring-layer.fs'),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'center',
          size: InstanceAttributeSize.TWO,
          update: o => [o.x, o.y],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'radius',
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.FOUR,
          name: 'depth',
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'color',
          size: InstanceAttributeSize.FOUR,
          update: o => o.color,
        },
        {
          block: 2,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'thickness',
          size: InstanceAttributeSize.ONE,
          update: o => [o.thickness],
        },
      ],
      uniforms: [
        {
          name: 'scaleFactor',
          size: UniformSize.ONE,
          update: (_: IUniform) => [scaleFactor()],
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
      vs: require('./ring-layer.vs'),
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
