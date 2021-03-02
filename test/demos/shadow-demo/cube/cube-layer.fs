varying vec2 _texCoord;
varying vec4 _color;
varying vec3 _lightProjCoords;
varying vec3 _normal;

void main() {
  float closestDepth = texture(lightDepth, _lightProjCoords.xy).r;
  float currentDepth = _lightProjCoords.z;
  float light = max(dot(_normal, lightDir), 0.0);
  float shadow = 1. - float(currentDepth - shadowBias > closestDepth || _lightProjCoords.z > 1.0);

  vec3 albedo = _color.rgb;
  vec3 lighting = albedo * 0.15; // hard-coded ambient component
  lighting += max(dot(_normal, lightDir), 0.0) * shadow * albedo * vec3(1., 1., 1.) * 0.85;

  ${out: color} = vec4(lighting, 1.0);
}
