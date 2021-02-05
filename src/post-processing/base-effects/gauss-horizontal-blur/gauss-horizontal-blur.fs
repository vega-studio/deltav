varying vec2 texCoord;

void main() {
  float dtx = 1.0 / color_size.x;
  vec3 result = texture2D(color, texCoord).rgb * weight[0];
  float index = 1.0;
  vec2 delta = vec2(0.0, 0.0);

  for(int i = 1; i < weight_length; ++i, index += 1.0) {
    delta.x = dtx * index;
    result += texture2D(color, texCoord + delta).rgb * weight[i];
    result += texture2D(color, texCoord - delta).rgb * weight[i];
  }

  gl_FragColor = vec4(result, 1.0);
  // gl_FragColor = vec4(texCoord, 0.0, 1.0);
}
