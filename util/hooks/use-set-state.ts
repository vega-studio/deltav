import React from "react";

/**
 * Provides a full state object that lets you apply partial state updates like
 * old react. Using this, the state object keeps the same reference while the
 * contents are updated. This helps with issues from closures capturing a single
 * state.
 */
export function useSetState<T extends object>(
  val: T
): [T, (partial: Partial<T> | ((p: T) => T)) => void] {
  const [state, setState] = React.useState<T>(val);

  return [
    state,
    (partial: Partial<T> | ((p: T) => T)) => {
      if (typeof partial === "function") {
        setState(partial);
        return;
      }

      setState((p) => {
        return { ...p, ...partial };
      });
    },
  ];
}
