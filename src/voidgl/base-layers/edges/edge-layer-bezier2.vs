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
  float t1 = 1 - t;
  return pow(t1, 3) * p1 + 3 * t * pow(t1, 2) * c1 + 3 * pow(t, 2) * t1 * c2 + pow(t, 3) * p2;
}
