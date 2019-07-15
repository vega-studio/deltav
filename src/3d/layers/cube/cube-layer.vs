${import: projection}

varying vec2 _texCoord;

void main() {
  ${attributes}

  vec4 pos = vec4(position * size, 1.0);
  vec4 world = transform * pos;
  _texCoord = texCoord;

  gl_Position = clipSpace(world.xyz);
}
