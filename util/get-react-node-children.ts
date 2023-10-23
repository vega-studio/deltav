import React from "react";

/**
 * Retrieves the children of a React node.
 */
export function getReactNodeChildren(node: React.ReactNode): React.ReactNode[] {
  if ("props" in (node as any)) {
    const children = (node as any).props?.children || [];

    return children.filter((child: React.ReactNode) =>
      React.isValidElement(child)
    );
  }

  return [];
}
