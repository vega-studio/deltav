${import: projection, transform}

varying vec2 _texCoord;
varying vec4 _color;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  mat4 m = transform(s, r, t);
  vec4 world = m * pos;
  _texCoord = texCoord;

  _color = mix(
    color,
    frontColor,
    float(normal.z == -1.)
  );

  gl_Position = clipSpace(world.xyz);
}
