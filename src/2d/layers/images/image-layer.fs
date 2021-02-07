precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(imageAtlas, texCoord) * vertexColor;
  gl_FragColor = gl_FragColor * gl_FragColor.a;
}
