import React from "react";
import { isString } from "./types";

type GroupFilterType =
  | string
  | React.JSXElementConstructor<any>
  | React.JSXElementConstructor<any>;

type GroupMap = Map<GroupFilterType, React.ReactNode[]>;

/**
 * Retrieves all of the base types of a class
 */
function getAllBaseTypes(classType: GroupFilterType): GroupFilterType[] {
  if (isString(classType)) {
    return [classType];
  }

  // Initialize an array to hold the class types, starting with the provided classType
  const types: GroupFilterType[] = [classType];

  // Get the prototype of the classType
  let currentPrototype = Object.getPrototypeOf(classType.prototype);

  // Loop through the prototype chain until reaching the end (Object.prototype)
  while (currentPrototype && currentPrototype !== Object.prototype) {
    types.push(currentPrototype.constructor);
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }

  return types;
}

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
        // Get all of the base types of the child so the grouping list can be
        // exhaustive enough to handle inherted types
        const baseTypes = getAllBaseTypes(child.type);

        for (let i = 0, iMax = baseTypes.length; i < iMax; ++i) {
          const childType = baseTypes[i];
          const group = groups.get(childType);

          if (!group) {
            if (outExcluded) outExcluded.push(child);
            continue;
          }

          group.push(child);
        }
      } else {
        // Get all of the base types of the child so the grouping list can be
        // exhaustive enough to handle inherted types
        const baseTypes = getAllBaseTypes(child.type);

        for (let i = 0, iMax = baseTypes.length; i < iMax; ++i) {
          const childType = baseTypes[i];
          let group = groups.get(childType);

          if (!group) {
            group = [];
            groups.set(childType, group);
          }

          group.push(child);
        }
      }
    }
  }

  return groups;
}
