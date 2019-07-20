// This shader renders our circles with POINTS mode. This can perform better for more intensive scenarios but comes at
// the cost of hardware limitations such as max POINT size and potential involuntary hardware culling decisions for the
// viewport.
precision highp float;



varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;

void main() {
  vertexColor = color;
  vertexColor.a *= layerOpacity;
  float size = radius * scaleFactor;
  edgeSharpness = mix(0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  edgeSharpnessBase = mix(0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));

  // NOTE: for now we keep depth * vertex where vertex is always one since our gl layer does not
  // support drawing non-instanced data yet.
  gl_Position = clipSpace(vec3(center, depth));
  gl_PointSize = size * 2.0 * pixelRatio;
}