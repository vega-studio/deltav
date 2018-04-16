precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  ${attributes}

  // Figure out the size of the image as it'd show on the screen
  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));
  // Do the test for when the image is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y;

  // If zooms are unequal, assume one is filtered to be 1.0
  bool unequalZooms = cameraScale.x > cameraScale.y || cameraScale.y > cameraScale.x;

  // Destructure threejs's bug with the position requirement
  float normal = position.x;
  float side = position.y;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + anchor;

  // Correct aspect ratio.  May need to be tied to a uniform
  // to allow for disabling when both axis' are scaling. 

  // Get the position of the current vertex
  texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0)));
  // Apply the image's tint as a tint to the image
  vertexColor = tint;

  size = mix(
    // This option keeps the image size in world space
    size,
    // This option counters the scaling of the image on the screen keeping it a static size
    (size * cameraScale.yx),
    float(unequalZooms)
  );

  vec2 vertex = vec2(side, float(normal == 1.0)) * size + location - (anchor * cameraScale.yx);
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
