int instanceSize = ${instanceBlockCount};

vec4 getBlock(int index, int instanceIndex) {
  return instanceData[(instanceSize * instanceIndex) + index];
}
