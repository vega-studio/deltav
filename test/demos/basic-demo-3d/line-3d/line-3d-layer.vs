${import: projection}

varying vec4 _color;

void main() {
  _color = mix(colorStart, colorEnd, interpolation);
  vec3 position = (end - start) * interpolation + start;
  gl_Position = clipSpace(position);
  gl_PointSize = 5.0;
}
