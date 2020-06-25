vec4 getControls(
  vec2 start,
  vec2 end,
  vec4 control,
  float depth,
  float scaleFactor,
  vec2 viewSize
) {
  vec4 startClip = clipSpace(vec3(start, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 control1 = startScreen + vec2(control.x, -control.y) * scaleFactor;

  vec4 controlClip2 = clipSpace(vec3(control.zw, depth));
  vec2 controlScreen2 = (controlClip2.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  
  return vec4(control1, controlScreen2);
}
