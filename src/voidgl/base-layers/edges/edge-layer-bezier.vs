/**
 * Makes a linear interpolation between two points
 *
 * @param {vec2} s The start point
 * @param {vec2} e The end point
 * @param {vec2} c The bezier control point
 * @param {float} t The interpolation value [0, 1]
 *
 * @returns {vec2} A point interpolated between the two provided points
 */
vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  return vec2(
    (1.0 - t) * (1.0 - t) * p1.x + 2.0 * t * (1.0 - t) * c1.x + t * t * p2.x,
    (1.0 - t) * (1.0 - t) * p1.y + 2.0 * t * (1.0 - t) * c1.y + t * t * p2.y
  );
}
