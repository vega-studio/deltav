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
    return {
      fs: require('./label-layer.fs'),
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
        {
          block: 2,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'label',
          size: InstanceAttributeSize.ATLAS,
          update: (o) => undefined,
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
          update: (vertex: number) => [
            // Normal
            (vertex % 2 === 0) ? 1 : -1,
            0,
            0,
          ],
        },
      ],
      vertexCount: 1,
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
