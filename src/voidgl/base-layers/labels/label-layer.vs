precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // Figure out the size of the label as it'd show on the screen
  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));
  // Do the test for when the label is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y;

  // If zooms are unequal, assume one is filtered to be 1.0
  bool unequalZooms = cameraScale.x > cameraScale.y || cameraScale.y > cameraScale.x;

  // Destructure threejs's bug with the position requirement
  float normal = position.x;
  float side = position.y;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + anchor;

  // Correct aspect ratio.
  size = mix(
    size,
    (size * cameraScale.yx),
    float(unequalZooms)
  );

  // apply scaling
  size *= scale;

  vec2 adjustedAnchor = mix(
    anchor,
    (anchor * cameraScale.yx),
    float(unequalZooms)
  );

  // Get the position of the current vertex
  vec2 vertex = vec2(side, float(normal == 1.0)) * size + location - adjustedAnchor;
  // Get the tex coord from our inject texture info
  texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0)));
  // Apply the label's color as a tint to the label (all labels are rendered white to the base texture)
  vertexColor = color;

  // See how scaled the size on screen will be from the actual height of the label
  float labelScreenScale = mix(
    screenSize.y / size.y,
    screenSize.x / size.x,
    float((cameraScale.x < 1.0) || (cameraScale.x > 1.0))
  );

  // If our screen rendering is larger than the size the label is supposed to be, then we automagically
  // scale down our label to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
    vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
    (anchorToVertex / labelScreenScale) + location,
    float(
      (
        scaling == 3.0 ||                  // NEVER mode - keep the image the same size always
        (largerOnScreen && scaling == 2.0) // BOUND_MAX mode - only if we're larger than the font size do we scale down
      ) &&
      scaling != 1.0                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
    )
  );

  gl_Position = clipSpace(vec3(vertex, depth));
}