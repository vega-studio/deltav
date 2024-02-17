/**
  This vertex shader calculates edges based in world space to make an edge based on
  bezier curves with 0, 1, and 2 control points.
**/
precision highp float;



varying vec4 vertexColor;

// Interpolation type injection
${interpolation}

void main() {
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;

  // Convert our world points to screen space
  vec4 startClip = clipSpace(vec3(start, depth));
  vec4 endClip = clipSpace(vec3(end, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 endScreen = (endClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Controls for this mode are screen space deltas from the end points
  vec2 control1 = startScreen + vec2(control.x, -control.y) * scaleFactor;
  vec2 control2 = endScreen + vec2(control.z, -control.w) * scaleFactor;

  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, startScreen, endScreen, control1, control2);
  // Calculate the next and previous segment's location on the line
  vec2 prePosition = interpolation(interpolationTime - interpolationIncrement, startScreen, endScreen, control1, control2);
  vec2 nextPosition = interpolation(interpolationTime + interpolationIncrement, startScreen, endScreen, control1, control2);

  vec2 preLine = prePosition - currentPosition;
  vec2 nextLine = nextPosition - currentPosition;

  // Get a spliced nromal at the joining of two segments to make a crisper curve
  vec2 currentNormal = mix(
    // Pick this value if we're at the beginning of the line
    normalize(vec2(preLine.y, -preLine.x)),
    mix(
      // Pick this value when we're between the ends
      normalize(vec2(preLine.y, -preLine.x) + vec2(-nextLine.y, nextLine.x)),
      // Pick this value if we're at the end of the line
      normalize(vec2(-nextLine.y, nextLine.x)),
      float(vertex.x >= 1.0)
    ),
    float(vertex.x > 0.0)
  );

  // Get the thickness based on the side we're on
  float lineThickness = mix(thickness.x, thickness.y, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertexPos = currentPosition + currentNormal * (-normal * lineThickness * scaleFactor);
  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = vec4((vertexPos / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), startClip.zw);
  gl_PointSize = 5.0;
}
