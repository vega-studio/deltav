// These are projection methods utilizing the simpler camera breakdown approach

vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale;
}

vec4 clipSpace(vec3 world) {
  return vec4(((projection * modelView) * vec4(cameraSpace(world), 1.0)).xyz, 1.0);
}
