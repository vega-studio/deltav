precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  const normal = position.x;
  const side = position.y;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + anchor;
  // Get the position of the current vertex
  vec2 position = vec2(side, normal / 2.0) * size + worldAnchor;

  vertexColor = color;
  gl_Position = clipSpace(vec3(center, depth));
}
