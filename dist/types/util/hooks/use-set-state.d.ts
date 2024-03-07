/**
 * Provides a full state object that lets you apply partial state updates like
 * old react. Using this, the state object keeps the same reference while the
 * contents are updated. This helps with issues from closures capturing a single
 * state.
 */
export declare function useSetState<T extends object>(val: T): [T, (partial: Partial<T> | ((p: T) => T)) => void];
