${import: projection}

void main() {
  vec4 pos = vec4(position * size, 1.0);
  vec4 world = transform * pos;

  gl_Position = clipSpace(world.xyz);
}
