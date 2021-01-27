// Coordinate of the vertex that should  wrap the glyph on the SDF lookup map
varying vec2 texCoord;
// The color the font should be
varying vec4 vertexColor;

// Smoothing value used in applying the alpha value to the rendering
const float smoothing = 1.0 / 16.0;

void main() {
  // Sample the SDF field for the signed distance at the given fragment
  float sdf = texture2D(fontMap, texCoord).a;
  // Perform the smoothing for the SDF rendering to calculate the transparency of the fragment
  float alpha = smoothstep(0.5 - smoothing, 0.5 + smoothing, sdf);
  // Apply the color the glyph will render with at the given calculated transparency the SDF provided
  gl_FragColor = vec4(vertexColor.rgb, vertexColor.a * alpha);
}
