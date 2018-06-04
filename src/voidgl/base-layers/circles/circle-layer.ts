import * as Three from 'three';
import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IProjection, IUniform, UniformSize, VertexAttributeSize } from '../../types';
import { CircleInstance } from './circle-instance';

export interface ICircleLayerProps extends ILayerProps<CircleInstance> {
  /** This sets a scaling factor for the circle's radius */
  scaleFactor?(): number;
}

export interface ICircleLayerState {

}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class CircleLayer extends Layer<CircleInstance, ICircleLayerProps, ICircleLayerState> {
  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor: (circle: CircleInstance) => new Bounds({
        height: circle.radius * 2,
        width: circle.radius * 2,
        x: circle.x - circle.radius,
        y: circle.y - circle.radius,
      }),

      // Provide a precise hit test for the circle
      hitTest: (circle: CircleInstance, point: IPoint, view: IProjection) => {
        const circleScreenCenter = view.worldToScreen(circle);
        const mouseScreen = view.worldToScreen(point);
        const r = circle.radius * this.props.scaleFactor();

        const delta = [
          mouseScreen.x - circleScreenCenter.x,
          mouseScreen.y - circleScreenCenter.y,
        ];

        return (delta[0] * delta[0] + delta[1] * delta[1]) < (r * r);
      },
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    const scaleFactor = this.props.scaleFactor || (() => 1);

    return {
      fs: require('./circle-layer.fs'),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'center',
          size: InstanceAttributeSize.TWO,
          update: (circle) => [circle.x, circle.y],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'radius',
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.radius],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.FOUR,
          name: 'depth',
          size: InstanceAttributeSize.ONE,
          update: (circle) => [circle.depth],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'color',
          size: InstanceAttributeSize.FOUR,
          update: (circle) => circle.color,
        },
      ],
      uniforms: [
        {
          name: 'scaleFactor',
          size: UniformSize.ONE,
          update: (uniform: IUniform) => [scaleFactor()],
        },
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          defaults: [0],
          name: 'position',
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [0, 0, 0],
        },
      ],
      vertexCount: 1,
      vs: require('./circle-layer.vs'),
    };
  }

  getModelType(): IModelType {
    return {
      modelType: Three.Points,
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return {
      premultipliedAlpha: true,
      transparent: true,
    };
  }
}
