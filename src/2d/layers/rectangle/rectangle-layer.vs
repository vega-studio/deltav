precision highp float;

varying vec4 vertexColor;

void main() {
  // Determine final screen size of label
  vec3 screenSize = cameraSpaceSize(vec3(size * scale / scaleFactor / maxScale, 1.0));

  // Test whether the label is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y || screenSize.x > size.x;

  // Determines if a scale mode should be used or not for the vertex
  float useScaleMode = float(
    (
      scaling == 3.0 ||                  // NEVER mode - keep the image the same size always
      (largerOnScreen && scaling == 2.0) // BOUND_MAX mode - only if we're larger than the font size do we scale down
    ) &&
    scaling != 1.0                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
  );

  // TODO: Correct aspect ratio. Sufficient fix for most applications.
  // Will need another solution in the case of:
  // (cameraScale2D.y != cameraScale2D.x) && (cameraScale2D.x != 1 && cameraScale2D.y != 1)

  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale2D.x != cameraScale2D.y);

  vec2 adjustedSize = mix(
    size,
    (size * cameraScale2D.yx),
    unequalZooms
  );

  // Destructure normals attribute
  float normal = normals.x;
  float side = normals.y;

  vec2 scaledAnchor = anchor * scale;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + scaledAnchor;

  vec2 adjustedAnchor = mix(
    scaledAnchor,
    (scaledAnchor * cameraScale2D.yx),
    unequalZooms
  );

  // Get the position of the current vertex
  vec2 vertex = vec2(side, float(normal == 1.0)) * scale * adjustedSize + location - adjustedAnchor;

  // See how scaled the size on screen will be from the actual height of the label
  float labelScreenScale = mix(
    screenSize.y / adjustedSize.y,
    screenSize.x / adjustedSize.x,
    float((cameraScale2D.x != 1.0))
  );

  float currentScale = labelScreenScale * scale;

  // If our screen rendering is larger than the size the label is supposed to be, then we automagically
  // scale down our label to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
    vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
    (anchorToVertex / labelScreenScale) + location,
    // This is the flag determining if a scale mode should be applied to the vertex
    useScaleMode
  );

  // --Texture and Color
  // Apply the label's color as a tint to the label (all labels are rendered white to the base texture)
  vertexColor = color;

  gl_Position = clipSpace(vec3(vertex, depth));
}
