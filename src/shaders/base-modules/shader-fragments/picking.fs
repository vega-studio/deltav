// This contains the method required to be used on a fragment shader when a layer desires to use
// PickType.SINGLE (color picking).
varying highp vec4 _picking_color_pass_;

highp vec4 setColor(vec4 color) {
  gl_FragColor = mix(color, _picking_color_pass_, pickingActive);

  if (color.a == 0.0) {
    discard;
  }

  return gl_FragColor;
}
