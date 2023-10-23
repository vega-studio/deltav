precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

vec2 interpolation(float t, vec2 center, float radius, float start, float end) {
  float angle = (end - start) * t + start;
  return center + vec2(cos(angle) * radius, sin(angle) * radius);
}

void main() {
  // Destructure some of the vec injections
  float startAngle = angle.x;
  float endAngle = angle.y;
  float widthStart = thickness.x;
  float widthEnd = thickness.y;

  // Convert world points to screen space
  vec4 centerClip = clipSpace(vec3(center, depth));
  vec2 centerScreen = (centerClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Destructure position attribute
  float normal = position.x;
  float interpolationTime = position.y;
  float interpolationIncrement = 1.0 / position.z;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, centerScreen, radius, startAngle, endAngle);
  // Get normal with currentPosition and center
  vec2 currentNormal = normalize(currentPosition - centerScreen);
  // Get the thickness based on the side we're on
  float lineThickness = mix(widthStart, widthEnd, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertex = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(colorStart, colorEnd, interpolationTime);
  vertexColor *= vertexColor.a;

  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), centerClip.zw);
  gl_PointSize = 5.0;
}
