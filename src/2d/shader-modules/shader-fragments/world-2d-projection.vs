// These are projection methods utilizing the simpler camera 2d approach.
// This assumes we have a 3D camera projection which should be preferably orthographic layered with simpler 2D camera
// controls for manipulating the 2D world.
vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale2D;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return worldSize * cameraScale2D;
}

vec4 clipSpace(vec3 world) {
  return vec4(((projection * modelView) * vec4(cameraSpace(world), 1.0)).xyz, 1.0);
}

vec4 clipSpaceSize(vec3 worldSize) {
  return vec4(((projection * modelView) * vec4(cameraSpaceSize(worldSize), 0.0)).xyz, 1.0);
}
