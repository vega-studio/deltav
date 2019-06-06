${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  vec2 scale = fontScale * cameraScale.xy;
  float scaleBy = max(scale.x, scale.y) / maxScale;
  vec2 pushOut = normals * glyphSize * fontScale;

  float vx = mix(
    (textAreaOrigin.x + origin.x + padding.x - anchor.x + offset.x + pushOut.x),
    textAreaAnchor.x + textAreaOrigin.x + (-textAreaAnchor.x + origin.x + padding.x - anchor.x + offset.x + pushOut.x) / scaleBy,
    float(scale.x >= maxScale)
  );

  float vy = mix(
    (textAreaOrigin.y + origin.y + padding.y - anchor.y + offset.y + pushOut.y),
    textAreaAnchor.y + textAreaOrigin.y + (-textAreaAnchor.y + origin.y + padding.y - anchor.y + offset.y + pushOut.y) / scaleBy,
    float(scale.y >= maxScale)
  );

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec3 position = vec3(vec2(vx, vy), depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
