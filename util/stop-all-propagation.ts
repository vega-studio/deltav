import React from "react";

/**
 * This is a VERY thorough event propogation halt. This prevents defaults
 * and propogation and handles native and React events.
 */
export function stopPropagation(
  e:
    | React.MouseEvent
    | React.ChangeEvent
    | (MouseEvent & { nativeEvent?: any })
    | Event
) {
  try {
    const anyEvent = e as any;
    anyEvent.stopPropagation?.();
    anyEvent.preventDefault?.();

    if (anyEvent.nativeEvent) {
      anyEvent.nativeEvent.stopImmediatePropagation?.();
      anyEvent.nativeEvent.stopPropagation?.();
      anyEvent.nativeEvent.preventDefault?.();
    }
    return false;
  } catch (_err) {
    // no - op
    return false;
  }
}
