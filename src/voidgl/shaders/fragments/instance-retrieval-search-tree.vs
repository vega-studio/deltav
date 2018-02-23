// This method finds the instance data in the uniforms. We use a binary tree to make
// the lookup as webgl 1.0 doesn't support switch() statements yet.
void getInstanceData(float i, inout vec4 d[${instanceBlockCount}]) {
  ${instanceDataBinaryTree}
}
