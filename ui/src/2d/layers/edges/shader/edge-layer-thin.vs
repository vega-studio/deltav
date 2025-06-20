
precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space
  where the curve is bezier curves with 0, 1, and 2 control points.

  This version uses a GL line to draw the edge with no consideration for a start
  and end thickness. Saves on performance.
**/
varying vec4 vertexColor;

// Interpolation type injection
${interpolation}

void main() {
  // Destructure vertex attribute
  float interpolationTime = vertex.y;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, start, end, control.xy, control.zw);

  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = clipSpace(vec3(currentPosition, depth));
  gl_PointSize = 5.0;
}
