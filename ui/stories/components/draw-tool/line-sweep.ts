import {
  add2,
  EdgeInstance,
  EdgeType,
  subtract2,
  type Vec2,
} from "../../../src/index.js";
import { LineSegments } from "./line-segment.js";

/**
 * This takes our intersections a step further and computes the actual
 * intersection information relative to the LineSegments/Edge. The
 * intersection computation in the other method is merely for a single two
 * point line segment, this is for an edge decomposed into multiple segments.
 */
function computeFinalIntersection(
  seg1: [Vec2, Vec2, LineSegments, boolean],
  seg2: [Vec2, Vec2, LineSegments, boolean]
): [Vec2, LineSegments, number, LineSegments, number] | null {
  const intersection = LineSegments.intersect(seg1, seg2);

  // If we intersect, we need to add it to the intersection list AND
  // calculate the true t value of the intersection relative to the
  // edges that collided. The intersection t value is merely the
  // intersection for the segment and NOT the edge as a whole.
  if (intersection) {
    const { 0: x, 1: y, 2: utEdge1, 3: utEdge2 } = intersection;
    const edge1 = seg1[2];
    const edge2 = seg2[2];

    // Find the segments index in each edge
    const index1 = edge1.segments.findIndex((s) => s === seg1);
    const index2 = edge2.segments.findIndex((s) => s === seg2);

    // See if the left edge attaches to the previous segment. If so, our time
    // from the intersection is going in the correct direction. Otherwise, it
    // needs to be reverse via 1 - t
    const isForward1 = seg1[3];
    const isForward2 = seg2[3];

    // If the segments come from the same LineSegments, then we see if the
    // intersection is an intersection between a segment and it's previous
    // segment. We discard those intersections as they are 99.99999% probably
    // just the formation of the segments.
    if (edge1 === edge2) {
      return null;
    }

    // Use the segment division amounts to get the t value that should
    // be associated
    const tEdge1 =
      index1 * edge1.tDivision +
      (isForward1 ? utEdge1 : 1 - utEdge1) * edge1.tDivision;
    const tEdge2 =
      index2 * edge2.tDivision +
      (isForward2 ? utEdge2 : 1 - utEdge2) * edge2.tDivision;

    // Compute the t value along checkEject line
    return [[x, y], edge1, tEdge1, edge2, tEdge2];
  }

  // No intersection
  return null;
}

/**
 * Contains various line sweep tests for detecting intersections between
 * objects.
 */
export class LineSweep {
  /**
   * This generalizes the line sweep algorithm to the sweep execution which
   * finds a target and a queue of targets that are potential interaction
   * candidates. This algorithm provides a callback for these moments of
   * execution but does not do any fine tuned tests. Consider this to be the
   * Broadphase portion of the algorithm.
   *
   * Note that the provided targets are SEGMENTS of the lines provided which are
   * in the format: [Vec2, Vec2, LineSegments]. These elements are elements in
   * the line.segments property.
   */
  static lineSweep(
    segments: LineSegments[],
    bucketOptimization = 1,
    test: (
      target: [Vec2, Vec2, LineSegments, boolean],
      queue: Set<[Vec2, Vec2, LineSegments, boolean]>
    ) => void
  ) {
    // Gather all segments from all edges.
    const allSegments = segments.flatMap((s) => s.segments);

    // Group the line segments into y buckets. We can determine the y bucket
    // ranges by examining the base edge ends and control points to find a min
    // and max y. We use the raw edges for this as it's much less processing to
    // get essentially the same range depicted by the segments.
    // The y buckets are an optimization to reduce max brute force intersection
    // checks.
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    for (let i = 0, iMax = segments.length; i < iMax; ++i) {
      const bounds = segments[i].getRoughYBounds();
      minY = Math.min(minY, bounds[0]);
      maxY = Math.max(maxY, bounds[1]);
    }

    // Buffer our end max so anything AT the max will not spill into a deeper
    // bucket
    maxY += 10;

    // Create bucket division lines
    const buckets: [Vec2, Vec2, LineSegments, boolean][][] = [[]];
    const numBuckets = bucketOptimization;
    const dy = (maxY - minY) / numBuckets;
    const dy_inv = 1 / dy;
    const bucketsBounds: Vec2[] = [];

    for (let i = 1; i < numBuckets; ++i) {
      bucketsBounds.push([minY + (i - 1) * dy, minY + i * dy]);
      buckets.push([]);
    }

    // Loop through all the segments and insert them into their own buckets.
    // Segments that cross bucket bounds are in both buckets
    for (let i = 0, iMax = allSegments.length; i < iMax; ++i) {
      const segment = allSegments[i];
      const startBucket = Math.floor((segment[0][1] - minY) * dy_inv);
      const endBucket = Math.floor((segment[1][1] - minY) * dy_inv);

      if (startBucket === endBucket) {
        buckets[startBucket].push(segment);
      } else {
        // Add forward when startBucket < endBucket
        for (let j = startBucket; j <= endBucket; ++j) {
          buckets[j].push(segment);
        }

        // Add backward when startBucket > endBucket
        for (let j = endBucket; j <= startBucket; ++j) {
          buckets[j].push(segment);
        }
      }
    }

    // Now we perform the line sweep algorithm per bucket
    for (let b = 0, bMax = buckets.length; b < bMax; ++b) {
      // Get the current bucket to operate on
      const bucket = buckets[b];
      // Sort all of the edges by X by their left side
      const sortedLeft = bucket.slice(0).sort((a, b) => a[0][0] - b[0][0]);
      // Sort all of the edges by X by their right side
      const sortedRight = bucket.sort((a, b) => a[1][0] - b[1][0]);
      // Retains all of the lines that should be tested against on each new event
      // point.
      const testQueue = new Set<[Vec2, Vec2, LineSegments, boolean]>();

      // Cursor indices
      let left = 0;
      let right = 0;

      for (; left < sortedLeft.length; ++left) {
        const cursor = sortedLeft[left][0];
        let checkEject = sortedRight[right];

        testQueue.add(sortedLeft[left]);

        while (cursor[0] >= checkEject[1][0]) {
          // We remove the ejected element from the test queue, when ejecting we
          // test that element against everything in the queue.
          if (testQueue.delete(checkEject)) {
            test(checkEject, testQueue);
          }

          right++;
          checkEject = sortedRight[right];
          if (!checkEject) break;
        }
      }

      // Finish the remaining right queue to perform remaining tests and
      // ejections.
      for (; right < sortedRight.length; ++right) {
        const checkEject = sortedRight[right];

        if (testQueue.delete(checkEject)) {
          test(checkEject, testQueue);
        }
      }
    }
  }

  /**
   * Performs a line sweep algorithm to compute ALL intersections for a list of
   * edges.
   *
   * There is a broadphase bucketization step in this algorithm to reduce the
   * need to brute force calculate all intersections. If there are few lines or
   * really small vertical space, this number can be reduced to improve
   * performance, or if a lot of vertical space, this can be increased to
   * improve performance.
   */
  static lineSweepIntersections(
    segments: LineSegments[],
    bucketOptimization = 1
  ) {
    const intersections: [Vec2, LineSegments, number, LineSegments, number][] =
      [];

    this.lineSweep(segments, bucketOptimization, (target, queue) => {
      queue.forEach((e) => {
        const intersection = computeFinalIntersection(target, e);

        if (intersection) {
          intersections.push(intersection);
        }
      });
    });

    return intersections;
  }

  /**
   * Performs a line sweep algorithm to compute intersections ONLY against the
   * targets specified. This will only perform the intersection test when it
   * involves the target and all other intersections will be ignored.
   *
   * There is a broadphase bucketization step in this algorithm to reduce the
   * need to brute force calculate all intersections. If there are few lines or
   * really small vertical space, this number can be reduced to improve
   * performance, or if a lot of vertical space, this can be increased to
   * improve performance.
   */
  static lineSweepIntersectionWith(
    targets: Set<LineSegments>,
    segments: LineSegments[],
    bucketOptimization = 1
  ) {
    const intersections: [Vec2, LineSegments, number, LineSegments, number][] =
      [];

    this.lineSweep(segments, bucketOptimization, (target, queue) => {
      if (targets.has(target[2])) {
        queue.forEach((e) => {
          const intersection = computeFinalIntersection(target, e);

          if (intersection) {
            intersections.push(intersection);
          }
        });
      } else {
        queue.forEach((e) => {
          if (!targets.has(e[2])) return;
          const intersection = computeFinalIntersection(target, e);

          if (intersection) {
            intersections.push(intersection);
          }
        });
      }
    });

    return intersections;
  }

  /**
   * Performs a line sweep algorithm to compute which segments intersects with a
   * provided circle. This does NOT provide intersection metrics, it simply
   * provides a list of line segments that DID intersect with the circle.
   *
   * There is a broadphase bucketization step in this algorithm to reduce the
   * need to brute force calculate all intersections. If there are few lines or
   * really small vertical space, this number can be reduced to improve
   * performance, or if a lot of vertical space, this can be increased to
   * improve performance.
   */
  static lineSweepIntersectionWithCircle(
    circle: { r: number; center: Vec2 },
    segments: LineSegments[],
    bucketOptimization = 1
  ) {
    // We make an edge that spans the width of the circle to be represented
    // within the sweep. When the sweep reaches this special case edge we can
    // use the sweep's test queue to test against the circle.
    const circleEdge = new LineSegments(
      new EdgeInstance({
        start: subtract2(circle.center, [circle.r, 0]),
        end: add2(circle.center, [circle.r, 0]),
      }),
      EdgeType.LINE
    );
    const circleSegment = circleEdge.segments[0];
    const intersections: [Vec2, Vec2, LineSegments, boolean][] = [];

    // Line sweep all of the segments with our circle edge added to it.
    this.lineSweep(
      segments.concat([circleEdge]),
      bucketOptimization,
      (target, queue) => {
        // If this is our circle edge, we do the segment to circle hit test
        if (circleSegment === target) {
          queue.forEach((e) => {
            if (LineSegments.intersectsCircle(e[0], e[1], circle)) {
              intersections.push(e);
            }
          });
        }

        // Otherwise, see if the queue has the circle in it
        else if (queue.has(circleSegment)) {
          if (LineSegments.intersectsCircle(target[0], target[1], circle)) {
            intersections.push(target);
          }
        }
      }
    );

    return intersections;
  }
}
