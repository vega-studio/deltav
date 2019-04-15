${import: projection}

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale.x != cameraScale.y);

  // actual size of a glyph
  vec2 size = glyphSize * fontScale;

  // Correct aspect ratio.
  vec2 adjustedSize = mix(
    size,
    (size * cameraScale.yx),
    unequalZooms
  );

  // Figure out the size of the image as it'd show on the screen
  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));
  
  // Do the test for when the image is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y;

  float normal = normals.x;
  float side = normals.y;

  vec2 vertex = vec2(float(normal == 1.0), side) * adjustedSize + origin - anchor + offset;
  
  // See how scaled the size on screen will be from the actual height of the image
  float imageScreenScale = mix(
    screenSize.y / adjustedSize.y,
    screenSize.x / adjustedSize.x,
    float((cameraScale.x < 1.0) || (cameraScale.x > 1.0))
  );

  vec2 anchorToVertex = vertex - origin;

  vec2 position = mix(
    // This option keeps the image size in world space
    vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
    anchorToVertex / imageScreenScale + origin,
    // This flag determines if scale mode should be applied to the vertex  
    float(largerOnScreen)
  );

  gl_Position = clipSpace(vec3(position, depth));

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
