varying vec2 _texCoord;
varying vec4 _color;
varying float _useTop;

void main() {
  gl_FragColor = mix(
    texture(sideImage, _texCoord),
    texture(topImage, _texCoord),
    _useTop
  );
}
