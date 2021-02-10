${import: projection, transform}

varying vec2 _texCoord;
varying float _useTop;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  mat4 m = transform(s, r, t);
  vec4 world = m * pos;
  _useTop = mix(0., 1., normal.y == 1.);

  _texCoord = mix(
    (sideUV.zw - sideUV.xy) * texCoord + sideUV.xy,
    (topUV.zw - topUV.xy) * texCoord + topUV.xy,
    _useTop
  );

  gl_Position = clipSpace(world.xyz);
}
