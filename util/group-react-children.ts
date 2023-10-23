import React from "react";

type GroupFilterType =
  | string
  | React.JSXElementConstructor<any>
  | React.JSXElementConstructor<any>;

type GroupMap = Map<GroupFilterType, React.ReactNode[]>;

/**
 * This is a helper method to sort a list of react children into groups, based
 * on their type. This accounds for nested React Fragments.
 *
 * Set pickTypes to only include certain types of children in the result.
 *
 * If outExcluded is provided, it will be populated with any children that were
 * not included in the result. This implies pickTypes must be specified for this
 * to be populated with any potential results.
 */
export function groupReactChildren(
  children: React.ReactNode,
  pickTypes?: GroupFilterType[],
  outExcluded?: React.ReactNode[]
): GroupMap {
  const groups: GroupMap = new Map();
  const toProcess: React.ReactNode[] = [];

  if (pickTypes) {
    pickTypes.forEach((type) => {
      groups.set(type, []);
    });
  }

  React.Children.forEach(children, (child, _i) => {
    toProcess.push(child);
  });

  toProcess.reverse();

  while (toProcess.length > 0) {
    const child = toProcess.pop();
    if (!React.isValidElement(child)) continue;

    if (child !== void 0 && child?.type === React.Fragment) {
      const reverse: React.ReactNode[] = [];

      React.Children.forEach(
        (child?.props as unknown as any)?.children || [],
        (fragChild) => {
          reverse.push(fragChild);
        }
      );

      for (let i = reverse.length - 1; i >= 0; --i) {
        toProcess.push(reverse[i]);
      }
    } else if (child !== void 0) {
      if (pickTypes) {
        const group = groups.get(child.type);

        if (!group) {
          if (outExcluded) outExcluded.push(child);
          continue;
        }

        group.push(child);
      } else {
        let group = groups.get(child.type);

        if (!group) {
          group = [];
          groups.set(child.type, group);
        }

        group.push(child);
      }
    }
  }

  return groups;
}
