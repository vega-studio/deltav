${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec2 pushOut = normals * glyphSize * fontScale;
  vec3 position = vec3(textAreaOrigin + textAreaAnchor + (origin + padding - anchor + offset + pushOut - textAreaAnchor) / cameraScale.xy , depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
