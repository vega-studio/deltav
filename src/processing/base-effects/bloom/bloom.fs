varying vec2 texCoord;

void main() {
  vec3 result = texture2D(color, texCoord).rgb;
  result += texture2D(glow, texCoord).rgb * 1.3;

  gl_FragColor = vec4(result, 1.0);
}
