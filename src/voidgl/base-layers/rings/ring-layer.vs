precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float borderSize;
varying vec2 pointCoord;

varying float scale;

void main() {
  ${attributes}

  scale = scaleFactor;

  vertexColor = color * color.a;
  float size = radius * scaleFactor;
  borderSize = mix(
    (thickness + 1.5) / size,
    ((thickness * pixelRatio) / size),
    float(pixelRatio > 1.0)
  );

  edgeSharpness = 5.0 * min(1.0 / size, 0.5);

  pointCoord = (position.xy + vec2(1.0, 1.0)) / 2.0;

  // Center within clip space
  vec4 clipCenter = clipSpace(vec3(center, depth));
  // Center in screen space
  vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Position in screen space
  vec2 vertex = (position.xy * size) + screenCenter;
  // Position back to clip space
  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
}
