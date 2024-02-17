// Shader for rendering simple circles on a quad, using the fragment shader to create the 'roundness' of the shape.
precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;
varying vec2 pointCoord;

void main() {
  vertexColor = color;
  vertexColor.a *= layerOpacity;
  float size = radius * cameraScale2D.x * pixelRatio;
  edgeSharpness = mix(0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  edgeSharpnessBase = mix(0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  pointCoord = (normals.xy + vec2(1.0, 1.0)) / 2.0;

  // Center within clip space
  vec4 clipCenter = clipSpace(vec3(center, depth));
  // Center in screen space
  vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Position in screen space
  vec2 vertex = (normals.xy * size) + screenCenter;
  // Position back to clip space
  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
}
