import React from "react";
export declare enum SurfaceJSXType {
    EVENT_MANAGER = 1,
    LAYER = 2,
    CAMERA = 3,
    PROVIDER = 4,
    RESOURCE = 5,
    VIEW = 6,
    SCENE = 7
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
export declare function groupSurfaceChildren(children: React.ReactNode, pickTypes?: SurfaceJSXType[], outExcluded?: React.ReactNode[]): GroupMap;
export {};
