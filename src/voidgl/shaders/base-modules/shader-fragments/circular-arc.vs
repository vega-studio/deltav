${import: fsin, fcos}

/**
 * A circular arc interpolator
 */
vec2 circularArc(float t, vec2 center, float radius, float start, float end) {
  float angle = (end - start) * t + start;
  return center + vec2(fcos(angle) * radius, fsin(angle) * radius);
}
