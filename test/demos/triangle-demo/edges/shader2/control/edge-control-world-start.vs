vec4 getControls(
  vec2 start,
  vec2 end,
  vec4 control,
  float depth,
  float scaleFactor,
  vec2 viewSize
) {
  vec4 controlClip1 = clipSpace(vec3(control.xy, depth));
  vec2 controlScreen1 = (controlClip1.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  
  vec4 startClip = clipSpace(vec3(start, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 control2 = startScreen + + vec2(control.z, -control.w) * scaleFactor;
  
  return vec4(controlScreen1, control2);
}