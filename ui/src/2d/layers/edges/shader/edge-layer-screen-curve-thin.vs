/**
 * This vertex shader calculates edges based in world space to make an edge
 * based on bezier curves with 0, 1, and 2 control points.
 * This implementation simply uses GL line to draw the edge with no
 * consideration for a start and end thickness. Saves on performance.
 */
precision highp float;

varying vec4 vertexColor;

// Interpolation type injection
{
  interpolation } void main() {
  // Destructure vertex attribute
  float interpolationTime = vertex.y;

  // Convert our world points to screen space
  vec4 startClip = clipSpace(vec3(start, depth));
  vec4 endClip = clipSpace(vec3(end, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0f, 1.0f)) * vec2(0.5f, 0.5f) * viewSize;
  vec2 endScreen = (endClip.xy + vec2(1.0f, 1.0f)) * vec2(0.5f, 0.5f) * viewSize;
  // Controls for this mode are screen space deltas from the end points
  vec2 control1 = startScreen + vec2(control.x, -control.y) * scaleFactor;
  vec2 control2 = endScreen + vec2(control.z, -control.w) * scaleFactor;

  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, startScreen, endScreen, control1, control2);

  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = vec4((currentPosition / viewSize) * vec2(2.0f, 2.0f) - vec2(1.0f, 1.0f), startClip.zw);
  gl_PointSize = 5.0f;
}
