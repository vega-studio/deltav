precision highp float;

/** This is the color of the ring */
varying vec4 vertexColor;
/**
 * This is how sharp the ring renders. For tiny rings, it's best to have
 * less sharpness to better convey the shape of a circle. A good starter setting:
 * edgeSharpness = mix(0.8, 0.01, min(gl_PointSize / 45.0, 1.0));
 */
varying float edgeSharpness;
/**
 * This should be a value that sets the thickness of the ring in normal space
 * relative to the PointSize
 */
varying float borderSize;
/**
 * Since this is now a quad instead of a point sprite, this provides what
 *gl_PointCoord used to provide.
 */
varying vec2 pointCoord;

varying float scale;

float circle(vec2 coord, float radius) {
  vec2 dist = coord - vec2(0.5f);

  return 1.0f - smoothstep(radius - (radius * edgeSharpness), radius, dot(dist, dist) * 4.0f);
}

void main() {
  float outer_step_factor = circle(pointCoord, 1.0f);
  float inner_step_factor = circle(pointCoord, 1.0f - borderSize * scale);

  gl_FragColor = mix(mix(                        // Select the outer color outside of the inner radius
  vec4(0.0f, 0.0f, 0.0f, 0.0f),    // Select invisible outside of inner and outer radius
  vertexColor,                  // Select outer color outside of inner, but inside outer
  outer_step_factor), vec4(0.0f, 0.0f, 0.0f, 0.0f),                 // Select inner color inside inner
  inner_step_factor);
}
