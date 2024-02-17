import React from "react";
type GroupFilterType = string | React.JSXElementConstructor<any> | React.JSXElementConstructor<any>;
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
export declare function groupReactChildren(children: React.ReactNode, pickTypes?: GroupFilterType[], outExcluded?: React.ReactNode[]): GroupMap;
export {};
