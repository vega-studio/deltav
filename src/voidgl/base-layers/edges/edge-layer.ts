import * as Three from 'three';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, InstanceIOValue, VertexAttributeSize } from '../../types';
import { shaderTemplate } from '../../util';
import { EdgeInstance } from './edge-instance';

export enum EdgeType {
  /** Makes a straight edge with no curve */
  LINE,
  /** Makes a single control point Bezier curve */
  BEZIER,
  /** Makes a two control point bezier curve */
  BEZIER2,
}

export interface IEdgeLayerProps extends ILayerProps<EdgeInstance> {
  /** Specifies how the edge is formed */
  type: EdgeType;
}

export interface IEdgeLayerState {}

/** Converts a control list to an IO value */
function toInstanceIOValue(value: [number, number][]): InstanceIOValue {
  return [
    value[0][0],
    value[0][1],
    value[1][0],
    value[1][1],
  ];
}

/** This picks the appropriate shader for the edge type desired */
const pickVS = {
  [EdgeType.LINE]: require('./edge-layer-line.vs'),
  [EdgeType.BEZIER]: require('./edge-layer-bezier.vs'),
  [EdgeType.BEZIER2]: require('./edge-layer-bezier2.vs'),
};

/** This is the base edge layer which is a template that can be filled with the needed specifics for a given line type */
const baseVS = require('./edge-layer.vs');

/**
 * This layer displays edges and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class EdgeLayer extends Layer<
  EdgeInstance,
  IEdgeLayerProps,
  IEdgeLayerState
> {
  // Set default props for the layer
  static defaultProps: IEdgeLayerProps = {
    data: null,
    key: 'none',
    type: EdgeType.LINE,
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<EdgeInstance> {
    const { type } = this.props;

    const MAX_SEGMENTS = type === EdgeType.LINE ? 2 : 50;

    // Calculate the normals and interpolations for our vertices
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      [MAX_SEGMENTS * 2 + 2]: -1,
    };

    const vertexInterpolation: { [key: number]: number } = {
      0: 0,
      [MAX_SEGMENTS * 2 + 2]: 1,
    };

    let sign = 1;
    for (let i = 0; i < MAX_SEGMENTS * 2; ++i) {
      vertexToNormal[i + 1] = sign;
      vertexInterpolation[i + 1] = Math.floor(i / 2) / (MAX_SEGMENTS - 1);
      sign *= -1;
    }

    const vs = shaderTemplate(baseVS, {
      // Retain the attributes injection
      attributes: '${attributes}',
      // Inject the proper interpolation method
      interpolation: pickVS[type],
    }, {
      name: 'Edge Layer',
      values: [
        'interpolation',
      ],
    });

    return {
      fs: require('./edge-layer.fs'),
      instanceAttributes: [
        {
          block: 0,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'start',
          size: InstanceAttributeSize.TWO,
          update: (o) => o.start,
        },
        {
          block: 0,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'end',
          size: InstanceAttributeSize.TWO,
          update: (o) => o.end,
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'widthStart',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.widthStart],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.TWO,
          name: 'widthEnd',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.widthEnd],
        },
        {
          block: 1,
          blockIndex: InstanceBlockIndex.THREE,
          name: 'depth',
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          block: 2,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'colorStart',
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.colorStart,
        },
        {
          block: 3,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'colorEnd',
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.colorEnd,
        },
        type === EdgeType.LINE ? {
          block: 4,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'control',
          size: InstanceAttributeSize.FOUR,
          update: (o) => [0, 0, 0, 0],
        } : null,
        type === EdgeType.BEZIER ? {
          block: 4,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'control',
          size: InstanceAttributeSize.FOUR,
          update: (o) => [o.control[0][0], o.control[0][1], 0, 0],
        } : null,
        type === EdgeType.BEZIER2 ? {
          block: 4,
          blockIndex: InstanceBlockIndex.ONE,
          name: 'control',
          size: InstanceAttributeSize.FOUR,
          update: (o) => toInstanceIOValue(o.control),
        } : null,
      ],
      uniforms: [],
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
            vertexInterpolation[vertex],
            // The number of vertices
            MAX_SEGMENTS * 2,
          ],
        },
      ],
      vertexCount: MAX_SEGMENTS * 2 + 2,
      vs: vs.shader,
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
