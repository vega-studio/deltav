/**
 * Shallow comparison of two objects
 */
export function shallowEqual(objA: any, objB: any) {
  if (!objA || !objB) {
    return objA === objB;
  }

  return !Boolean(
    Object.keys(Object.assign({}, objA, objB)).find(
      key => objA[key] !== objB[key]
    )
  );
}
