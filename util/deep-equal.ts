/**
 * Compares all properties deeply between two objects for equality.
 */
export function deepEqual<
  T extends Record<keyof T, any>,
  U extends Record<keyof U, any>,
>(a: T, b: U, checked?: Set<any>): boolean {
  if ((a as unknown) === b) return true;

  checked = checked || new Set();
  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b) as (keyof U)[];

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let i = 0, iMax = aKeys.length; i < iMax; i++) {
    const key = aKeys[i];
    const aValue = a[key];
    const bValue = b[key];
    if (checked.has(aValue) && checked.has(bValue)) continue;

    checked.add(aValue);
    checked.add(bValue);

    // We cast here because typescript makes a wrong assumption abou thte
    // comparison
    if (aValue === (bValue as unknown)) continue;

    if (typeof aValue === "object" && typeof bValue === "object") {
      if (!deepEqual(aValue, bValue)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
