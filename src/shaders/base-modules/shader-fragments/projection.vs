// These are projection methods for basic camera operations
${import: camera}

vec3 cameraSpace(vec3 world) {
  return (modelView * vec4(world, 1.0)).xyz;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return (modelView * vec4(worldSize, 0.0)).xyz;
}

vec4 clipSpace(vec3 world) {
  return (projection * modelView) * vec4(world, 1.0);
}

vec4 clipSpaceSize(vec3 worldSize) {
  return (projection * modelView) * vec4(worldSize, 0.0);
}
