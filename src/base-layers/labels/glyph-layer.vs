${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  // vec2 pushOut = quadVertex * fontMap_size;
  vec2 pushOut = quadVertex * glyphSize * fontScale;
  vec3 position = vec3(origin - anchor + offset + pushOut, depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * quadVertex;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
