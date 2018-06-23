precision highp float;

${picking}
varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(labelAtlas, texCoord) * vertexColor;
  setColor(gl_FragColor * gl_FragColor.a);
}
