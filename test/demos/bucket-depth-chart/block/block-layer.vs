${import: projection}
varying vec4 _color;
void main() {

  // The value of the vertex
  vec3 value = mix(
    startValue,
    endValue,
    float(position.x)
  );

  float depth = baseZ + position.z * value.z * 0.5;
  float distanceToCenter = distance(cameraPosition, vec3(bottomCenter, depth));
  float distanceToOrigin = distance(cameraPosition, vec3(bottomCenter, 0.0));
  float scale =  distanceToCenter / distanceToOrigin; 
  vec3 pos = vec3(value.x * scale, (baseY + mix(0.0, value.y, position.y)) * scale, depth);
  _color = color;
  gl_Position = clipSpace(pos);
}