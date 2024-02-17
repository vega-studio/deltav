/**
 * Shallow comparison of two objects
 */
export function shallowCompare(objA: any, objB: any) {
  if (!objA || !objB) {
    return objA === objB;
  }

  return !Object.keys(Object.assign({}, objA, objB)).find(
    (key) => objA[key] !== objB[key]
  );
}
