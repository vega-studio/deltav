float fmod(float x, float m, float m_inv) {
  return x - m * floor(x * m_inv);
}
