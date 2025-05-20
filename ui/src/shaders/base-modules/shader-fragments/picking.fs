// This contains the method required to be used on a fragment shader when a layer desires to use
// PickType.SINGLE (color picking).
varying highp vec4 _picking_color_pass_;

void main() {
  ${out: _picking_fragment_} = _picking_color_pass_;
  // _picking_fragment_ = vec4(1.0, 0.0, 0.0, 1.0);
}
