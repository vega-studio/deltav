varying vec4 vertexColor;

void main() {
  float startAngle = angle.x;
  float endAngle = angle.y;
  float interpolationTime = vertex.x;
  float normal = vertex.y;

  float middleAngle = (startAngle + endAngle) * 0.5;
  float halfAngle = (endAngle - startAngle) * 0.5;

  float deltaR = mix(gap / sin(halfAngle), 0.0, float(abs(sin(halfAngle)) <= 0.000001));

  vec2 newCenter = center + deltaR * vec2(cos(middleAngle), sin(middleAngle));

  float newRadius = mix(
      sqrt(radius * radius - gap * gap) - gap * cos(halfAngle) / sin(halfAngle), 
      radius, 
      float(abs(sin(halfAngle)) <= 0.000001)
    );

  float curAngle = mix(startAngle, endAngle, interpolationTime);

  vec2 pos = newCenter + normal * newRadius * vec2(cos(curAngle), sin(curAngle));

  vertexColor = color;

  gl_Position = clipSpace(vec3(pos, depth));
}