import React from "react";
import { PromiseResolver } from "../../util/promise-resolver.js";
import { groupSurfaceChildren, SurfaceJSXType } from "./group-surface-children.js";
/**
 * Base class for any type of JSX resource that provides a result through a
 * promise resolver.
 */
export interface IResolverProvider<T> {
    /**
     * DO NOT USE:
     * This is provided by the Surface system and is used internally to resolve
     * resources to the correct types.
     */
    surfaceJSXType: SurfaceJSXType;
    /**
     * DO NOT USE:
     * This is provided by the Surface system and is used internally to resolve
     * resources back up to the surface.
     * The resolver that must have a value passed through it for a surface to use.
     * The Surface will hang up and not render until all resolvers have provided
     * their appropriate resource.
     */
    resolver?: PromiseResolver<T | null>;
    /**
     * An optional name for the resource, this helps key the resource in the JSX
     * and potentially within the underlying deltav framework.
     */
    name?: string | number | null;
    /**
     * Pass a ref through here to receive the resolver for the resource.
     */
    share?: React.MutableRefObject<PromiseResolver<T | null> | null>;
}
/**
 * This simplifies having child IResolverProvider components that will provide
 * their meaningful resource to the parent via a resolver. This maps existing or
 * new resolvers to the child's props, and assign appropriate
 *
 * @param allResolvers A map that will contain all of the currently existing
 *                     resolvers. This should typically be a map tied to a
 *                     RefObject so it is not reset every render.
 *
 * @param children     The result of groupSurfaceChildren
 *
 * @param type         The SurfaceJSXType we wish to filter the results by
 *
 * @param startKey     A key object we use so multiple executions of this hook
 *                     are able to begin keying properly. The same key object
 *                     should be passed to each so the current value can get
 *                     incremeneted.
 */
export declare function useChildResolvers<TResolve, TProps extends IResolverProvider<TResolve> = IResolverProvider<TResolve>>(allResolvers: Map<string, PromiseResolver<any>>, children: ReturnType<typeof groupSurfaceChildren>, type: SurfaceJSXType, startKey?: {
    current: number;
}, baseName?: string): [
    React.ReactNode[] | undefined | null,
    Promise<(Awaited<TResolve> | null)[]>,
    {
        resolvers: React.MutableRefObject<PromiseResolver<TResolve | null>[]>;
        nameConflict: Set<string | number | null | undefined>;
    }
];
/**
 * If you use the useChildResolver multiple times, you will end up with several
 * lists of children that need to be put together. This makes that easier.
 */
export declare function concatChildren(...children: (React.ReactNode[] | undefined | null)[]): React.ReactNode[];
