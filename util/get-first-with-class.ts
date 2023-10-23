/**
 * Searches up the DOM tree for the first instance of a given class to be
 * located. If none exists no result will be returned.
 */
export function getFirstWithClass(element: HTMLElement, className: string) {
  // Extract the element that is a row from the target
  let next: HTMLElement | null = element;

  while (next && !next.classList.contains(className)) {
    next = next.parentElement;
  }

  return next;
}
