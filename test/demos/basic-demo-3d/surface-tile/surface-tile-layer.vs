${import: projection}

varying vec2 _texCoord;
varying vec4 _color;

void main() {
  vec3 world = mix(
    mix(
      c1,
      c2,
      float(corner == 2.0)
    ),
    mix(
      c3,
      c4,
      float(corner == 4.0)
    ),
    float(corner > 2.0)
  );

  _texCoord = texCoord;
  _color = color;

  gl_Position = clipSpace(world);
  gl_PointSize = 5.0;
}
