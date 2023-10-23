/**
 * Stops propagation of an event in all ways imagineable.
 */
export function stopPropagation(e: any) {
  e.stopPropagation?.();
  e.preventDefault?.();

  if (e.nativeEvent) {
    e.nativeEvent.stopImmediatePropagation?.();
    e.nativeEvent.stopPropagation?.();
    e.nativeEvent.preventDefault?.();
  }
}
