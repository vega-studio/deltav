import React from "react";
/**
 * This is a helper method to retrieve only a single type of child component
 * from a React children list. This accounts for nested React fragments.
 */
export declare function filterReactChildren<T>(type: T | T[], children: React.ReactNode, fail?: (child: React.ReactNode) => void): React.ReactNode[];
