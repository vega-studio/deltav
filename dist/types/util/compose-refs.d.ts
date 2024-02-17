import React from "react";
/**
 * Applies a component's ref to multiple refs
 */
export declare function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): (n: T) => void;
