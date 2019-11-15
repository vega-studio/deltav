${import: projection}
varying vec4 _color;
void main() {

  // The value of the vertex
  vec3 value = mix(
    startValue,
    endValue,
    float(position.x)
  );

  // Position
  float depth = baseZ + position.z * value.z * 0.5;
  float distanceToCenter = distance(cameraPosition, vec3(bottomCenter, depth));
  float distanceToOrigin = distance(cameraPosition, vec3(bottomCenter, 0.0));
  float scale =  distanceToCenter / distanceToOrigin; 
  vec3 pos = vec3(value.x * scale, (baseY + mix(0.0, value.y, position.y)) * scale, depth);

  // Color
  vec3 N = mix(
    mix(normal2, normal3, float(nIndex == 2.0)), 
    normal1, 
    float(nIndex == 0.0)
  );
 
  vec3 L = normalize(cameraPosition - pos);
  vec3 R = reflect(-L, normalize(N));

  float diffuseFactor = max(dot(normalize(N), -L), 0.0);
  vec4 ambientColor = color;
  vec4 diffuseColor = diffuseFactor * color;  

  vec4 vertexColor = ambientColor + diffuseColor;

  _color = vertexColor;
  gl_Position = clipSpace(pos);
}