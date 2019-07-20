${import: projection}

void main() {
  vec4 pos = vec4(position * scale, 1.0);
  vec4 world = transform * pos;
  // vec4 world = mat4(1.,0.,0.,0., 0.,1.,0.,0., 0.,0.,1.,0., 0.,0.,0.,1.) * pos;

  gl_Position = clipSpace(world.xyz);
  gl_PointSize = 20.0;

  // gl_Position = vec4(world.xyz / 2.0, 1.0);
}
