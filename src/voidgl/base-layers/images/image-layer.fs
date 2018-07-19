precision highp float;

${picking}
varying vec4 vertexColor;
varying vec2 texCoord;
${extendHeader}

void main() {
  gl_FragColor = texture2D(imageAtlas, texCoord) * vertexColor;
  setColor(gl_FragColor * gl_FragColor.a);
  ${extend}
}
