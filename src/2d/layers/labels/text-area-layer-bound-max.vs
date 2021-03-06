varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec2 scale = fontScale * cameraScale2D.xy;
  float scaleBy = max(scale.x, scale.y) / maxScale;
  vec2 pushOut = normals * glyphSize * fontScale;

  float vx = mix(
    (origin.x + padding.x + offset.x + pushOut.x),
    origin.x + anchor.x + (padding.x - anchor.x + offset.x + pushOut.x) / scaleBy,
    float(scale.x >= maxScale)
  );

  float vy = mix(
    (origin.y + padding.y + offset.y + pushOut.y),
    origin.y + anchor.y + (padding.y - anchor.y + offset.y + pushOut.y) / scaleBy,
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
