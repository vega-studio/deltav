vec4 getGl_Position(vec2 start, vec2 end, vec2 vertexPos, float depth, vec2 viewSize) {
  vec4 startClip = clipSpace(vec3(start, depth));
  return vec4((vertexPos / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), startClip.zw);
}