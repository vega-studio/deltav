float wrap(float value, float start, float end) {
  float width = end - start;
  float offsetValue = value - start;

  return (offsetValue - (floor(offsetValue / width) * width)) + start;
}
