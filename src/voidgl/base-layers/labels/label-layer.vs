precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;

void main() {
  ${attributes}

  vertexColor = color;
  gl_PointSize = radius * 2.0;
  edgeSharpness = mix(0.8, 0.01, min(gl_PointSize / 45.0, 1.0));
  gl_Position = clipSpace(vec3(center, depth));
}
