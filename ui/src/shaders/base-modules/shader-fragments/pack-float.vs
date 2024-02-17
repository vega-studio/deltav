vec4 bitSh = vec4(16777216., 65536., 256., 1.);
vec4 bitMsk = vec4(0., vec3(1. / 256.0));
vec4 bitShifts = vec4(1.) / vec4(16777216., 65536., 256., 1.);

vec4 packFloat(float value, float range) {
  value = (value + range) / (range * 2.);
  vec4 comp = fract(value * bitSh);
  comp -= comp.xxyz * bitMsk;
  return comp;
}

float unpackFloat(vec4 color, float range) {
  return dot(color , bitShifts) * (range * 2.) - range;
}
