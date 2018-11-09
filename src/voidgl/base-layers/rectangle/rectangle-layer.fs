precision highp float;

varying vec4 vertexColor;
${extendHeader}

void main() {
  setColor(vertexColor);
  ${extend}
}
