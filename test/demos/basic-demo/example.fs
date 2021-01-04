void main() {
  vec4 result = texture2D(color, texCoord).rgb;
  result += texture2D(glow, texCoord).rgb;

  gl_FragColor = vec4(result, 1.0);
}
