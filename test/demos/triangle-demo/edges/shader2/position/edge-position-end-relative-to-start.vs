vec4 getPositions(
  vec2 start, 
  vec2 end, 
  float depth, 
  float scaleFactor, 
  vec2 viewSize) 
{
  vec4 startClip = clipSpace(vec3(start, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 endPoint = startScreen + vec2(end.x, -end.y);
  return vec4(startScreen, endPoint);
}
