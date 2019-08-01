varying vec2 _texCoord;
varying vec4 _color;

void main() {
  gl_FragColor = mix(
    _color,
    vec4(1.0, 1.0, 1.0, 1.0),
    float(_texCoord.x <= 0.01 || _texCoord.x > 0.99 || _texCoord.y < 0.01 || _texCoord.y > 0.99)
  );
}
