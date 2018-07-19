precision highp float;

varying vec4 vertexColor;
${extendHeader}

void main() {
  gl_FragColor = vertexColor;

  ${extend}
}
