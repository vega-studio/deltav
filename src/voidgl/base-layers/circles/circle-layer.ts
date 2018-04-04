import * as Three from 'three';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IUniform, UniformSize, VertexAttributeSize } from '../../types';
import { CircleInstance } from './circle-instance';

export interface ICircleLayerProps extends ILayerProps<CircleInstance> {
}

export interface ICircleLayerState {

}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class CircleLayer extends Layer<CircleInstance, ICircleLayerProps, ICircleLayerState> {
  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    return {
      fs: require('./circle-layer.fs'),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'center',
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.x, o.y],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'radius',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.radius],
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.FOUR,
          name: 'depth',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'color',
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
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
      blending: Three.CustomBlending,
      blendSrc: Three.OneFactor,
      premultipliedAlpha: true,
      transparent: true,
    };
  }
}
