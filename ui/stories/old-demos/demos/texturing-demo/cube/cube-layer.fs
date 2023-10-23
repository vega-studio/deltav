varying vec2 _texCoord;
varying vec4 _color;
varying float _useTop;

void main() {
  ${out: color} = mix(
    texture(sideImage, _texCoord),
    texture(topImage, _texCoord),
    _useTop
  );

  // ${out: color} = vec4(1., 0., 0., 1.);
}
