${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale.x != cameraScale.y);

  vec2 size = glyphSize * fontScale;

  // Correct aspect ratio.
  vec2 adjustedSize = mix(
    size,
    (size * cameraScale.yx),
    unequalZooms
  );

  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));

  float normal = normals.x;
  float side = normals.y;

  vec2 vertex = vec2(float(normal == 1.0), side) * adjustedSize + origin - anchor + offset;

  float imageScreenScale = mix(
    screenSize.y / adjustedSize.y,
    screenSize.x / adjustedSize.x,
    float((cameraScale.x < 1.0) || (cameraScale.x > 1.0))
  );

  // If our screen rendering is larger than the size the image is supposed to be, then we automagically
  // scale down our image to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - origin;

  gl_Position = clipSpace(vec3((anchorToVertex / imageScreenScale + origin), depth));

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
