/**
 * This checks to see if the specified child IS a child of the indicated parent.
 */
export function hasChild(
  parent: HTMLElement | null,
  child: HTMLElement | null
) {
  if (!parent || !child) return false;
  let next: any = child;

  while (next) {
    if (next === parent) return true;
    next = next.parentNode;
  }

  return false;
}
