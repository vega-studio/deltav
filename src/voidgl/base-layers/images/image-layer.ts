import * as Three from 'three';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IUniform, UniformSize, VertexAttributeSize } from '../../types';
import { ImageInstance } from './image-instance';

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
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ImageInstance> {
    console.warn('Images layer is not developed yet. Do not use this feature yet.');

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
