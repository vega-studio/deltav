/**
 * This file contains the logic for handling edge picking via quad tree and hit tests.
 * The methods involved are fairly robust and would clutter the layer's code file.
 */
import { IPoint } from '../../primitives';
import { Bounds } from '../../primitives/bounds';
import { IPickingMethods } from '../../surface/layer';
import { IProjection } from '../../types';
import { add2, length2, scale2, subtract2, Vec2 } from '../../util/vector';
import { EdgeInstance } from './edge-instance';
import { IEdgeLayerProps } from './edge-layer';
import { EdgeBroadPhase, EdgeScaleType, EdgeType } from './types';
const { pow } = Math;

type InterpolationMethod = (t: number, p1: [number, number], p2: [number, number], c1: [number, number], c2: [number, number]) => Vec2;

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
const interpolation: {[key: number]: InterpolationMethod } = {
  [EdgeType.LINE]: linear,
  [EdgeType.BEZIER]: bezier,
  [EdgeType.BEZIER2]: bezier2,
};

/** Converts a point array to a point object */
function toPointObject(point: [number, number]): IPoint {
  return {
    x: point[0],
    y: point[1],
  };
}

/** Converts a point object to a point array */
function toPointArray(point: IPoint): [number, number] {
  return [
    point.x,
    point.y,
  ];
}

/**
 * This generates the picking methods needed for managing PickType.ALL for the edge layer.
 */
export function edgePicking(props: IEdgeLayerProps): IPickingMethods<EdgeInstance> {
  const { broadphase, scaleType, type } = props;
  const interpolate = interpolation[props.type];

  const boundsAccessor = (edge: EdgeInstance) => {
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
    if (props.type === EdgeType.BEZIER) {
      bounds.encapsulate({
        x: edge.control[0][0],
        y: edge.control[0][1],
      });
    }

    // Encapsulating the bezier control points is enough of a broadphase for beziers
    else if (props.type === EdgeType.BEZIER2) {
      bounds.encapsulate({
        x: edge.control[0][0],
        y: edge.control[0][1],
      });

      bounds.encapsulate({
        x: edge.control[1][0],
        y: edge.control[1][1],
      });
    }

    if (broadphase === EdgeBroadPhase.PASS_X) {
      bounds.x = Number.MIN_SAFE_INTEGER / 2;
      bounds.width = Number.MAX_SAFE_INTEGER;
    }

    if (broadphase === EdgeBroadPhase.PASS_Y) {
      bounds.y = Number.MIN_SAFE_INTEGER / 2;
      bounds.height = Number.MAX_SAFE_INTEGER;
    }

    return bounds;
  };

  if (scaleType === EdgeScaleType.SCREEN_CURVE) {
    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor,

      // Provide a precise hit test for the edge. This method performs all of the rendering
      // And hit tests within screen space as opposed to world space.
      hitTest: (edge: EdgeInstance, point: IPoint, view: IProjection) => {
        // Let's specify a resolution level for testing
        const TEST_RESOLUTION = 50;
        point = view.worldToScreen(point);
        const mouse: [number, number] = [point.x, point.y];
        let closestIndex = 0;
        let closestDistance = Number.MAX_VALUE;

        const start = view.worldToScreen(toPointObject(edge.start));
        const end = view.worldToScreen(toPointObject(edge.end));
        let control1, control2;

        if (type === EdgeType.BEZIER) {
          control1 = add2(toPointArray(start), edge.control[0]);
        }

        else if (type === EdgeType.BEZIER2) {
          control1 = add2(toPointArray(start), edge.control[0]);
          control2 = add2(toPointArray(end), edge.control[1]);
        }

        const startPoint = toPointArray(start);
        const endPoint = toPointArray(end);

        // Loop through sample points on the line and find one that is closest to the mouse point as possible
        for (let i = 0; i < TEST_RESOLUTION; ++i) {
          const linePoint = interpolate(
            i / TEST_RESOLUTION,
            startPoint,
            endPoint,
            edge.control.length > 0 ? control1 : [0, 0],
            edge.control.length > 1 ? control2 : [0, 0],
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

  return {
    // Provide the calculated AABB world bounds for a given circle
    boundsAccessor,

    // Provide a precise hit test for the edge
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
