${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  vec2 scale = fontScale * cameraScale.xy;
  float maxScale = max(scale.x, scale.y);
  vec2 pushOut = normals * glyphSize * fontScale;

  float vx = mix(
    (-anchor.x + offset.x + pushOut.x),
    (-anchor.x + offset.x + pushOut.x) / maxScale,
    float(scale.x >= 1.0)
  );

  float vy = mix(
    (-anchor.y + offset.y + pushOut.y),
    (-anchor.y + offset.y + pushOut.y) / maxScale,
    float(scale.y >= 1.0)
  );

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec3 position = vec3(origin + padding + vec2(vx, vy), depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
