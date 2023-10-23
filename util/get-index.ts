/**
 * Mobx does NOT like retrieving out of bounds on an array. This is a warning
 * safe way to do the retrieval.
 */
export function getIndex<T>(list: T[], index: number): T | undefined {
  if (index < list.length) return list[index];
}
