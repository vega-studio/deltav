varying vec4 vertexColor;
varying vec4 vertexEdgeColor;
varying vec2 pos;
varying vec2 circleCenter;
varying vec2 vertexStart;
varying vec2 vertexEnd;

void main() {
  float startAngle = angle.x;
  float endAngle = angle.y;
  float interpolationTime = vertex.x;
  float normal = vertex.y;

  circleCenter = center;
  float middleAngle = (startAngle + endAngle) * 0.5;
  float deltaAngle = endAngle - startAngle;
  float halfAngle = (endAngle - startAngle) * 0.5;
  float deltaR = 2.0 / sin(deltaAngle);
  vec2 newCenter = center + (2.0 / sin(halfAngle)) * vec2(cos(middleAngle), sin(middleAngle));
  vertexStart = newCenter + radius * vec2(cos(startAngle), sin(startAngle));
  vertexEnd = newCenter + radius * vec2(cos(endAngle), sin(endAngle));

  float curAngle = mix(startAngle, endAngle, interpolationTime);
  pos = newCenter + normal * (radius - deltaR) * vec2(cos(curAngle), sin(curAngle));

  vertexColor = color;
  vertexEdgeColor = edgeColor;

  gl_Position = clipSpace(vec3(pos, depth));
}