import React from "react";

/**
 * This is a helper method to retrieve only a single type of child component
 * from a React children list. This accounts for nested React fragments.
 */
export function filterReactChildren<T>(
  type: T | T[],
  children: React.ReactNode,
  fail?: (child: React.ReactNode) => void
) {
  const flattenedChildren: React.ReactNode[] = [];
  const toProcess: (React.ReactNode | React.ReactNode[])[] = [];

  React.Children.forEach(children, (child, _i) => {
    toProcess.push(child);
  });

  toProcess.reverse();

  while (toProcess.length > 0) {
    const child = toProcess.pop();
    const anyChild = child as any;

    if (Array.isArray(child)) {
      toProcess.push(...child.slice(0).reverse());
    } else if (anyChild !== void 0 && anyChild?.type === React.Fragment) {
      const reverse: React.ReactNode[] = [];

      React.Children.forEach(anyChild?.props?.children || [], (fragChild) => {
        reverse.push(fragChild);
      });

      for (let i = reverse.length - 1; i >= 0; --i) {
        toProcess.push(reverse[i]);
      }
    } else if (anyChild !== void 0 && anyChild?.type === type) {
      flattenedChildren.push(child);
    } else if (fail !== void 0 && child !== null) {
      fail(child);
    }
  }

  return flattenedChildren;
}
