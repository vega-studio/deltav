${import: projection, transform}

varying vec2 _texCoord;
varying vec4 _color;
varying vec3 _lightProjCoords;
varying vec3 _normal;

void main() {
  vec4 pos = m * vec4(position * size, 1.0);
  pos.w = 1.0;
  _texCoord = texCoord;

  _color = mix(
    color,
    frontColor,
    float(normal.z == -1.)
  );

  gl_Position = clipSpace(pos);
  vec4 lightPosition = lightViewProj * pos;
  _lightProjCoords = (lightPosition.xyz / lightPosition.w) * 0.5 + 0.5;
  _normal = (m * vec4(normal, 0.)).xyz;
}
