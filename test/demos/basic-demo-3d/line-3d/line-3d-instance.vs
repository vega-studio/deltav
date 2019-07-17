${import: projection}

varying vec3 _color;

void main() {
  vec3 position = (end - start) * interpolation + start;
  gl_Position = clipSpace(position);
  _color = mix(colorStart, colorEnd, interpolation);
}
