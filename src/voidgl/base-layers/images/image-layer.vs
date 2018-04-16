precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // Figure out the size of the image as it'd show on the screen
  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));
  // Do the test for when the image is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y;
  // Logic choice of which method for scaling to use
  float scaleLogic = float(
      (
        scaling == 3.0 ||                  // NEVER mode - keep the image the same size always
        (largerOnScreen && scaling == 2.0) // BOUND_MAX mode - only if we're larger than the font size do we scale down
      ) &&
      scaling != 1.0                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
  );

  float normal = position.x;
  float side = position.y;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + anchor;
  // Get the position of the current vertex
  texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0)));
  // Apply the image's tint as a tint to the image
  vertexColor = tint;

  // This should be the passed in vec2 uniform with 1.0 on the axis needing to retain aspect ratio.
//  vec2 aspectRatioAdjust = vec2(1.0, 0.0);

//  vec2 scaleEqualizer = aspectRatioAdjust * cameraScale.yx;

  size = mix(
    // This option keeps the image size in world space
    (size * cameraScale.yx),
    // + aspectRatioAdjust)
    // - vec2(1.0, 1.0))),
//    (size * vec2(1.0, 1.0)),
    // This option counters the scaling of the image on the screen keeping it a static size
    size,
    scaleLogic);

  vec2 vertex = vec2(side, float(normal == 1.0)) * size + location - anchor;
  // Get the tex coord from our inject texture info

  // See how scaled the size on screen will be from the actual height of the image
  float imageScreenScale = screenSize.y / size.y;

  // If our screen rendering is larger than the size the image is supposed to be, then we automagically
  // scale down our image to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
    vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
    (anchorToVertex / imageScreenScale) + location,
    scaleLogic);
  
  gl_Position = clipSpace(vec3(vertex, depth));
}
