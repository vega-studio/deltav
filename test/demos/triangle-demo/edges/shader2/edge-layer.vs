

precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

// Interpolation type injection
${interpolation}
${getPositions}
${getSizes}
${getControls}
${addPaddings}
${getGl_Position}


void main() {
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;

  vec4 positions = getPositions(start, end, depth, scaleFactor, viewSize);
  vec4 newPositions = addPaddings(positions, paddings);
  vec2 s = newPositions.xy;
  vec2 e = newPositions.zw;

  vec4 controls = getControls(start, end, control, depth, scaleFactor, viewSize);

  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, s, e, controls.xy, controls.zw);
  // Calculate the next and previous segment's location on the line
  vec2 prePosition = interpolation(interpolationTime - interpolationIncrement, s, e, controls.xy, controls.zw);
  vec2 nextPosition = interpolation(interpolationTime + interpolationIncrement, s, e, controls.xy, controls.zw);

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
  vec2 size = getSizes(thickness, scaleFactor);
  // Get the thickness based on the side we're on
  float lineThickness = mix(size.x , size.y, interpolationTime)  / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertexPos = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = getGl_Position(start, end, vertexPos, depth, viewSize);
  gl_PointSize = 5.0;
}
