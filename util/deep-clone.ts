/**
 * Creates a deeply cloned copy of the given object and handles circular
 * references.
 */
export function deepClone<T extends object>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const temp = obj.constructor();

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      temp[key] = deepClone(obj[key] as T);
    }
  }

  return temp;
}
