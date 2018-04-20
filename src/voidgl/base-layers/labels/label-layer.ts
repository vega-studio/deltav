import * as Three from 'three';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, IUniform, UniformSize, VertexAttributeSize } from '../../types';
import { LabelInstance } from './label-instance';

export interface ILabelLayerProps extends ILayerProps<LabelInstance> {
  atlas?: string;
}

export interface ILabelLayerState {

}

/**
 * This layer displays Labels and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class LabelLayer extends Layer<LabelInstance, ILabelLayerProps, ILabelLayerState> {
  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<LabelInstance> {
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
      fs: require('./label-layer.fs'),
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
            name: 'labelAtlas',
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
        {
          block: 4,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'scale',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.scale],
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
      vs: require('./label-layer.vs'),
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
