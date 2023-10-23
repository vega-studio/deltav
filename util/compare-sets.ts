/**
 * Coompares two sets to see if each set is equal to each other in size and in
 * content.
 */
export function compareSets(a: Set<any>, b: Set<any>) {
  if (a.size !== b.size) return false;

  for (let it = a.values(), val = null; (val = it.next().value); ) {
    if (!b.has(val)) return false;
  }

  return true;
}
