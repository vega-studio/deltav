/**
 * This file contains the logic for handling edge picking via quad tree and hit tests.
 * The methods involved are fairly robust and would clutter the layer's code file.
 */
import { Bounds } from "../../primitives/bounds";
import { IPickingMethods } from "../../surface/layer";
import { IProjection } from "../../types";
import {
  add2,
  copy2,
  dot2,
  length2,
  scale2,
  subtract2,
  Vec2
} from "../../util/vector";
import { EdgeInstance } from "./edge-instance";
import { IEdgeLayerProps } from "./edge-layer";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";
const { pow } = Math;

type InterpolationMethod = (
  t: number,
  p1: Vec2,
  p2: Vec2,
  c1: Vec2,
  c2: Vec2
) => Vec2;

/** This is an interpolation across a line */
function linear(t: number, p1: Vec2, p2: Vec2, _c1: Vec2, _c2: Vec2): Vec2 {
  return add2(scale2(subtract2(p2, p1), t), p1);
}

/** This is an interpolation across a bezier curve, single control */
function bezier(t: number, p1: Vec2, p2: Vec2, c1: Vec2, _c2: Vec2): Vec2 {
  return [
    (1.0 - t) * (1.0 - t) * p1[0] + 2.0 * t * (1.0 - t) * c1[0] + t * t * p2[0],
    (1.0 - t) * (1.0 - t) * p1[1] + 2.0 * t * (1.0 - t) * c1[1] + t * t * p2[1]
  ];
}

/** This is an interpolation across a bezier curve, double control */
function bezier2(t: number, p1: Vec2, p2: Vec2, c1: Vec2, c2: Vec2): Vec2 {
  const t1 = 1.0 - t;

  return [
    pow(t1, 3.0) * p1[0] +
      3.0 * t * pow(t1, 2.0) * c1[0] +
      3.0 * pow(t, 2.0) * t1 * c2[0] +
      pow(t, 3.0) * p2[0],
    pow(t1, 3.0) * p1[1] +
      3.0 * t * pow(t1, 2.0) * c1[1] +
      3.0 * pow(t, 2.0) * t1 * c2[1] +
      pow(t, 3.0) * p2[1]
  ];
}

/** A quick lookup for an interpolation method based on Edge Type */
const interpolation: { [key: number]: InterpolationMethod } = {
  [EdgeType.LINE]: linear,
  [EdgeType.BEZIER]: bezier,
  [EdgeType.BEZIER2]: bezier2
};

/** Takes two points that forms a line then calculates the nearest distance from that line to the third point */
function distanceTo(start: Vec2, end: Vec2, p: Vec2) {
  // Make a vector from a line point to the indicated point
  const vector: Vec2 = subtract2(start, p);
  const lineDirection: Vec2 = subtract2(end, start);
  const lineNormal: Vec2 = [lineDirection[1], -lineDirection[0]];
  const distance: number =
    Math.abs(dot2(vector, lineNormal)) / length2(lineDirection);

  // The distance is d = |v . r| where v is a unit perpendicular vector to the Line
  return distance;
}

// This sets the number of iterations along a curve we sample to test collisions with
const TEST_RESOLUTION = 50;

/**
 * This generates the picking methods needed for managing PickType.ALL for the edge layer.
 */
export function edgePicking<T extends EdgeInstance>(
  props: IEdgeLayerProps<T>
): IPickingMethods<EdgeInstance> {
  const { broadphase, minPickDistance = 0, scaleType, type } = props;
  const interpolate = interpolation[props.type];

  const boundsAccessor = (edge: EdgeInstance) => {
    const edgeStart = edge.thickness[0] / 2 + minPickDistance;
    const edgeEnd = edge.thickness[1] / 2 + minPickDistance;
    // Encapsulate the endpoints as they are guaranteed to be included in the shape
    // Each endpoint will be a box that includes the endpoint thickness
    const bounds = new Bounds({
      height: edge.thickness[0],
      width: edge.thickness[0],
      x: edge.start[0] - edgeStart,
      y: edge.start[1] - edgeStart
    });

    bounds.encapsulate(
      new Bounds({
        height: edge.thickness[1],
        width: edge.thickness[1],
        x: edge.end[0] - edgeEnd,
        y: edge.end[1] - edgeEnd
      })
    );

    // Encapsulating the bezier control points is enough of a broadphase for beziers
    if (props.type === EdgeType.BEZIER) {
      bounds.encapsulate(edge.control[0]);
    } else if (props.type === EdgeType.BEZIER2) {
      // Encapsulating the bezier control points is enough of a broadphase for beziers
      bounds.encapsulate(edge.control[0]);
      bounds.encapsulate(edge.control[1]);
    }

    if (broadphase === EdgeBroadphase.PASS_X) {
      bounds.x = Number.MIN_SAFE_INTEGER / 2;
      bounds.width = Number.MAX_SAFE_INTEGER;
    }

    if (broadphase === EdgeBroadphase.PASS_Y) {
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
      hitTest: (edge: EdgeInstance, point: Vec2, view: IProjection) => {
        point = view.worldToScreen(point);
        const mouse: Vec2 = point;
        let closestIndex = 0;
        let closestDistance = Number.MAX_VALUE;
        let secondClosestIndex = 0;
        let secondClosestDistance = Number.MAX_VALUE;

        const start = view.worldToScreen(edge.start);
        const end = view.worldToScreen(edge.end);
        let control1: Vec2 = [0, 0];
        let control2: Vec2 = [0, 0];

        if (type === EdgeType.BEZIER) {
          control1 = add2(start, edge.control[0]);
        } else if (type === EdgeType.BEZIER2) {
          control1 = add2(start, edge.control[0]);
          control2 = add2(end, edge.control[1]);
        }

        const startPoint = copy2(start);
        const endPoint = copy2(end);

        control1 = edge.control.length > 0 ? control1 : [0, 0];
        control2 = edge.control.length > 1 ? control2 : [0, 0];

        // Loop through sample points on the line and find one that is closest to the mouse point as possible
        for (let i = 0; i < TEST_RESOLUTION; ++i) {
          const linePoint = interpolate(
            i / TEST_RESOLUTION,
            startPoint,
            endPoint,
            control1,
            control2
          );
          const distance = length2(subtract2(mouse, linePoint));

          if (distance < closestDistance) {
            secondClosestIndex = closestIndex;
            secondClosestDistance = closestDistance;
            closestIndex = i;
            closestDistance = distance;
          } else if (distance < secondClosestDistance) {
            secondClosestIndex = i;
            closestDistance = distance;
          }
        }

        const t = closestIndex / TEST_RESOLUTION;
        const lineWidth =
          (edge.thickness[1] - edge.thickness[0]) * t + edge.thickness[0];

        if (closestIndex === secondClosestIndex) {
          return false;
        }

        const startSegment = interpolate(
          closestIndex / TEST_RESOLUTION,
          startPoint,
          endPoint,
          control1,
          control2
        );

        const endSegment = interpolate(
          secondClosestIndex / TEST_RESOLUTION,
          startPoint,
          endPoint,
          control1,
          control2
        );

        // See how close the mouse is to the line between the two closest points for a more accurate
        // Test
        closestDistance = distanceTo(startSegment, endSegment, mouse);

        // This helps determine if the mouse is beyond the end point
        if (
          dot2(
            subtract2(endSegment, startSegment),
            subtract2(mouse, startSegment)
          ) < 0
        ) {
          return false;
        }

        return closestDistance < lineWidth / 2.0 + minPickDistance;
      }
    };
  }

  return {
    // Provide the calculated AABB world bounds for a given circle
    boundsAccessor,

    // Provide a precise hit test for the edge
    hitTest: (edge: EdgeInstance, point: Vec2, _view: IProjection) => {
      const mouse: Vec2 = point;
      let closestIndex = 0;
      let closestDistance = Number.MAX_VALUE;

      // Loop through sample points on the line and find one that is closest to the mouse point as possible
      for (let i = 0; i < TEST_RESOLUTION; ++i) {
        const linePoint = interpolate(
          i / TEST_RESOLUTION,
          edge.start,
          edge.end,
          edge.control.length > 0 ? edge.control[0] : [0, 0],
          edge.control.length > 1 ? edge.control[1] : [0, 0]
        );
        const distance = length2(subtract2(mouse, linePoint));

        if (distance < closestDistance) {
          closestIndex = i;
          closestDistance = distance;
        }
      }

      const t = closestIndex / TEST_RESOLUTION;
      const lineWidth =
        (edge.thickness[1] - edge.thickness[0]) * t + edge.thickness[0];

      return closestDistance < lineWidth / 2.0;
    }
  };
}
