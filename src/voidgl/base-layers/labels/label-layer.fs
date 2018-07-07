precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;
${extendHeader}

void main() {
  gl_FragColor = texture2D(labelAtlas, texCoord) * vertexColor;
  gl_FragColor *= gl_FragColor.a;
  ${extend}
}
