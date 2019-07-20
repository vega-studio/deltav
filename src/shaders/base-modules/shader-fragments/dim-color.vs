${import: hsv}

vec4 dimColor(vec4 inputColor) {
  vec3 hsv = rgb2hsv(inputColor.rgb);
  hsv.z *= dimming;

  return vec4(mix(inputColor.rgb, hsv2rgb(hsv), float(dimming > 0.0)), inputColor.w);
}
