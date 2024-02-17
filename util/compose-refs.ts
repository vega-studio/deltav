import React from "react";

function isRefObject<T>(ref: React.Ref<T>): ref is React.RefObject<T> {
  return Boolean(ref && (ref as any).current !== void 0);
}

/**
 * Applies a component's ref to multiple refs
 */
export function composeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): (n: T) => void {
  return (n: T) => {
    for (let i = 0, iMax = refs.length; i < iMax; ++i) {
      const ref = refs[i];

      if (ref) {
        if (isRefObject(ref)) {
          (ref as React.MutableRefObject<T>).current = n;
        } else {
          ref(n);
        }
      }
    }
  };
}
