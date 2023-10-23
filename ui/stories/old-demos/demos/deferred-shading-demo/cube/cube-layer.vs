${import: projection, transform, rotation}

varying vec2 _texCoord;
varying vec4 _color;
varying vec4 _position;
varying vec3 _normal;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  vec4 world = m * pos;
  _texCoord = texCoord;

  gl_Position = clipSpace(world.xyz);

  _color = mix(
    color,
    frontColor,
    float(normal.z == -1.)
  );

  // Transfer the world space position to the fragment shader for deferred
  // shading
  _position = world;
  _normal = (m * vec4(normal, 0.)).xyz;
}
