/**
 * A non-recursive method to flatten an input array of items or list to a single
 * array
 */
export function flattenArray<T>(arr: (T | T[])[]): T[] {
  const out: T[] = [];
  const toProcess = arr.slice(0);
  toProcess.reverse();

  while (toProcess.length > 0) {
    const next = toProcess.pop();
    if (Array.isArray(next)) {
      const add = next.slice(0);
      add.reverse();
      toProcess.push(...add);
    } else if (next) out.push(next);
  }

  return out;
}
