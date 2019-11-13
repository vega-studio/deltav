${import: projection}
varying vec4 _color;
void main() {
  // The value of the vertex
  vec3 value = mix(
    startValue,
    endValue,
    float(position.x)
  );

  float scale = distance(cameraPosition, vec3(bottomCenter, value.z)) / distance(cameraPosition, vec3(bottomCenter, 0.0));
  vec3 pos = vec3(value.x * scale, (baseLine + mix(0.0, value.y, position.y)) * scale, value.z);
  _color = color;
  gl_Position = clipSpace(pos);
}