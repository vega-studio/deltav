precision highp float;

${picking}
varying vec4 vertexColor;
${extendHeader}

void main() {
  setColor(vertexColor);
  ${extend}
}
