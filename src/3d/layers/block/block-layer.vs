${import: projection}
varying vec4 _color;
void main() {
  // The value of the
  vec3 value = mix(
    startValue,
    endValue,
    float(position.x)
  );
  vec3 pos = vec3(value.x, baseLine + mix(0.0, value.y, position.y), value.z);
  _color = color;
  gl_Position = clipSpace(pos);
}