// These are projection methods utilizing the simpler camera breakdown approach
${import: camera}

vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return worldSize * cameraScale;
}

vec4 clipSpace(vec3 world) {
  return vec4(((projection * modelView) * vec4(cameraSpace(world), 1.0)).xyz, 1.0);
}

vec4 clipSpaceSize(vec3 worldSize) {
  return vec4(((projection * modelView) * vec4(cameraSpaceSize(worldSize), 0.0)).xyz, 1.0);
}
