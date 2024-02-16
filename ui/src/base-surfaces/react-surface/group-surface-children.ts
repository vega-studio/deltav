import React from "react";

export enum SurfaceJSXType {
  EVENT_MANAGER = 1,
  LAYER = 2,
  CAMERA = 3,
  PROVIDER = 4,
  RESOURCE = 5,
  VIEW = 6,
  SCENE = 7,
}

/**
 * This is the base props required to be a viable surface resource type for the
 * surface.
 */
export interface ISurfaceJSXResource {
  surfaceJSXType: SurfaceJSXType;
}

type GroupMap = Map<SurfaceJSXType, React.ReactNode[]>;

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
export function groupSurfaceChildren(
  children: React.ReactNode,
  pickTypes?: SurfaceJSXType[],
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

    if (
      child !== void 0 &&
      (child?.type === React.Fragment || child.props.surfaceJSXType === void 0)
    ) {
      if (!(child?.props as unknown as any)?.children) {
        if (outExcluded) outExcluded.push(child);
        continue;
      }

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

      continue;
    } else if (child !== void 0) {
      if (child.props.surfaceJSXType === void 0) {
        if (outExcluded) outExcluded.push(child);
        continue;
      }

      if (pickTypes) {
        const group = groups.get(child.props.surfaceJSXType);

        if (!group) {
          if (outExcluded) outExcluded.push(child);
          continue;
        }

        group.push(child);
      } else {
        let group = groups.get(child.props.surfaceJSXType);

        if (!group) {
          group = [];
          groups.set(child.props.surfaceJSXType, group);
        }

        group.push(child);
      }
    }
  }

  return groups;
}
