precision highp float;

${picking}
varying vec4 vertexColor;
${extendHeader}

void main() {
  setColor(vertexColor);
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  ${extend}
}
