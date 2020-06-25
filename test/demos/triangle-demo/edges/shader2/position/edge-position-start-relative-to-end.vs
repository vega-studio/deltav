vec4 getPositions(
  vec2 start, 
  vec2 end, 
  float depth, 
  float scaleFactor, 
  vec2 viewSize) 
{
  vec4 endClip = clipSpace(vec3(end, depth));
  vec2 endScreen = (endClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 startPoint = endScreen + vec2(start.x, -start.y) * scaleFactor;
  return vec4(startPoint, endScreen);
}
