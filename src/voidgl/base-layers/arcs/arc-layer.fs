precision highp float;

varying vec4 vertexColor;
${extendHeader}

void main() {
  setColor(vertexColor);
  gl_FragColor = vertexColor;
  ${extend}
}
