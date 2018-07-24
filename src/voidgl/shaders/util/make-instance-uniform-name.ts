const INSTANCE_UNIFORM_ATTRIBUTE_PREFIX = "u";

export function makeInstanceUniformNameArray() {
  return `instanceData`;
}

export function makeInstanceUniformNameTree(index: number) {
  return `${INSTANCE_UNIFORM_ATTRIBUTE_PREFIX}${index.toString(31)}`;
}
