${import: picking}
${import: projection, frame, PI2}

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

  // Uncomment to make things move around
  // world.y *= sin(((currentFrame / 600.0) * PI2) + (world.x / 1000.)) * sin(((currentFrame / 200.0) * PI2) + (world.z / 100.)) * sin(((currentFrame / 300.0) * PI2) + (world.x / 1000.)) * sin(((currentFrame / 50.0) * PI2) + (world.x / 333.));

  // _color = mix(
  //   vec4(0.9882352941, 0.6588235294, 0.4549019608, 1.),
  //   vec4(0.9, 0.1, 0.2, 1.),
  //   world.y / 200.0
  // );
  _color = color;

  gl_Position = clipSpace(world);
  gl_PointSize = 5.0;
}
