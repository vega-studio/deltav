vec4 encoder_ = vec4(1., 255., 65025., 16581375.);
vec4 packer_ = vec4(1. / 255., 1. / 255., 1. / 255., 0.);
vec4 unpacker_ = vec4(1., 1. / 255., 1. / 65025., 1. / 16581375.);

vec4 packFloat(float v) {
  vec4 enc = encoder_ * v;
  enc = fract(enc);
  enc -= enc.yzww * packer_;

  return enc;
}

float unpackFloat(vec4 rgba) {
  return dot(rgba, unpacker_);
}
