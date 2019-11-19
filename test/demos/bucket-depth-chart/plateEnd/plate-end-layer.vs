${import: projection}

varying vec4 _color;

void main() {

  // X
  float baseX = base.x;
  // Y
  float y = position.y * height;
  // Z
  float baseZ = base.y;
  float depth = baseZ + position.x * width * 0.5;

  // Position
  float distanceToCenter = distance(cameraPosition, vec3(bottomCenter, depth));
  float distanceToOrigin = distance(cameraPosition, vec3(bottomCenter, 0.0));
  float scale =  distanceToCenter / distanceToOrigin;

  vec3 pos = vec3(baseX * scale, y * scale, depth); 

  vec3 N = normalize(normal);

  vec3 L = normalize(lightDirection); //normalize(cameraPosition - pos);
  vec3 R = reflect(-L, normalize(N));

  float diffuseFactor = max(dot(normalize(N), -L), 0.0);
  vec4 ambientColor = color;
  vec4 diffuseColor = diffuseFactor * color;  

  vec4 vertexColor = ambientColor + diffuseColor;

  _color = vec4(vertexColor.rgb, color.a);

  gl_Position = clipSpace(pos);
}