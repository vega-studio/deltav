varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(color, texCoord);
}
