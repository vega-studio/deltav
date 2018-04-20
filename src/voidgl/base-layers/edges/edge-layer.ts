import * as Three from 'three';
import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, InstanceAttributeSize, InstanceBlockIndex, InstanceIOValue, IProjection, VertexAttributeSize } from '../../types';
import { shaderTemplate } from '../../util';
import { add2, length2, scale2, subtract2, Vec2 } from '../../util/vector';
import { EdgeInstance } from './edge-instance';

const { pow } = Math;

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

/** This is an interpolation across a line */
function linear(t: number, p1: [number, number], p2: [number, number], c1: [number, number], c2: [number, number]): Vec2 {
  return add2(scale2(subtract2(p2, p1), t), p1);
}

/** This is an interpolation across a bezier curve, single control */
function bezier(t: number, p1: [number, number], p2: [number, number], c1: [number, number], c2: [number, number]): Vec2 {
  return [
    (1.0 - t) * (1.0 - t) * p1[0] + 2.0 * t * (1.0 - t) * c1[0] + t * t * p2[0],
    (1.0 - t) * (1.0 - t) * p1[0] + 2.0 * t * (1.0 - t) * c1[0] + t * t * p2[0],
  ];
}

/** This is an interpolation across a bezier curve, double control */
function bezier2(t: number, p1: [number, number], p2: [number, number], c1: [number, number], c2: [number, number]): Vec2 {
  const t1 = 1.0 - t;

  return [
    (pow(t1, 3.0) * p1[0]) + (3.0 * t * pow(t1, 2.0) * c1[0]) + (3.0 * pow(t, 2.0) * t1 * c2[0]) + (pow(t, 3.0) * p2[0]),
    (pow(t1, 3.0) * p1[1]) + (3.0 * t * pow(t1, 2.0) * c1[1]) + (3.0 * pow(t, 2.0) * t1 * c2[1]) + (pow(t, 3.0) * p2[1]),
  ];
}

/** A quick lookup for an interpolation method based on Edge Type */
const interpolation = {
  [EdgeType.LINE]: linear,
  [EdgeType.BEZIER]: bezier,
  [EdgeType.BEZIER2]: bezier2,
};

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
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    const interpolate = interpolation[this.props.type];

    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor: (edge: EdgeInstance) => {
        // Encapsulate the endpoints as they are guaranteed to be included in the shape
        // Each endpoint will be a box that includes the endpoint thickness
        const bounds = new Bounds({
          height: edge.widthStart,
          width: edge.widthStart,
          x: edge.start[0] - edge.widthStart / 2,
          y: edge.start[1] - edge.widthStart / 2,
        });

        bounds.encapsulate(new Bounds({
          height: edge.widthEnd,
          width: edge.widthEnd,
          x: edge.end[0] - edge.widthEnd / 2,
          y: edge.end[1] - edge.widthEnd / 2,
        }));

        // Encapsulating the bezier control points is enough of a broadphase for beziers
        if (this.props.type === EdgeType.BEZIER) {
          bounds.encapsulate({
            x: edge.control[0][0],
            y: edge.control[0][1],
          });
        }

        // Encapsulating the bezier control points is enough of a broadphase for beziers
        else if (this.props.type === EdgeType.BEZIER2) {
          bounds.encapsulate({
            x: edge.control[0][0],
            y: edge.control[0][1],
          });

          bounds.encapsulate({
            x: edge.control[1][0],
            y: edge.control[1][1],
          });
        }

        return bounds;
      },

      // Provide a precise hit test for the ring
      hitTest: (edge: EdgeInstance, point: IPoint, view: IProjection) => {
        // Let's specify a resolution level for testing
        const TEST_RESOLUTION = 50;
        const mouse: [number, number] = [point.x, point.y];
        let closestIndex = 0;
        let closestDistance = Number.MAX_VALUE;

        // Loop through sample points on the line and find one that is closest to the mouse point as possible
        for (let i = 0; i < TEST_RESOLUTION; ++i) {
          const linePoint = interpolate(
            i / TEST_RESOLUTION,
            edge.start,
            edge.end,
            edge.control.length > 0 ? edge.control[0] : [0, 0],
            edge.control.length > 1 ? edge.control[1] : [0, 0],
          );
          const distance = length2(subtract2(mouse, linePoint));

          if (distance < closestDistance) {
            closestIndex = i;
            closestDistance = distance;
          }
        }

        const t = closestIndex / TEST_RESOLUTION;
        const lineWidth = (edge.widthEnd - edge.widthStart) * t + edge.widthStart;

        return closestDistance < (lineWidth / 2.0);
      },
    };
  }

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
