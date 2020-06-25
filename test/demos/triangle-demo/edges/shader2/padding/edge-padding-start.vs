vec4 addPaddings(vec4 positions, vec4 padding) {
  return vec4(positions.xy + padding.xy, positions.zw);
}