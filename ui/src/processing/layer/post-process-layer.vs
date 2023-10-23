varying vec2 texCoord;

void main() {
  gl_Position = vec4(vertex, 0.0, 1.0);
  texCoord = tex;
}
