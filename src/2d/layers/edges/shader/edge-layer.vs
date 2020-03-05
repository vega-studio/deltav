

precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

// Interpolation type injection
${interpolation}

void main() {
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, start, end, control.xy, control.zw);
  // Calculate the next and previous segment's location on the line
  vec2 prePosition = interpolation(interpolationTime - interpolationIncrement, start, end, control.xy, control.zw);
  vec2 nextPosition = interpolation(interpolationTime + interpolationIncrement, start, end, control.xy, control.zw);

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
  vec2 vertexPos = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = clipSpace(vec3(vertexPos, depth));
  gl_PointSize = 5.0;

  // gl_Position = clipSpace(vec3(0., 0., 0.));
}
