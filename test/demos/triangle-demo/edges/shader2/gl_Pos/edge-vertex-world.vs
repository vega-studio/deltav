vec4 getGl_Position(vec2 start, vec2 end, vec2 vertexPos, float depth, vec2 viewSize) {
  return clipSpace(vec3(vertexPos, depth));
}
