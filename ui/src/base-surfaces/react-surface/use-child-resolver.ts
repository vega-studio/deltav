import React from "react";
import { PromiseResolver } from "../../util/promise-resolver";
import { SurfaceJSXType, groupSurfaceChildren } from "./group-surface-children";
import { isDefined } from "../../util";

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
export function useChildResolvers<
  TResolve,
  TProps extends IResolverProvider<TResolve> = IResolverProvider<TResolve>,
>(
  allResolvers: Map<string, PromiseResolver<any>>,
  children: ReturnType<typeof groupSurfaceChildren>,
  type: SurfaceJSXType,
  startKey = { current: 0 },
  baseName = ""
): [
  React.ReactNode[] | undefined | null,
  Promise<(Awaited<TResolve> | null)[]>,
  {
    resolvers: React.MutableRefObject<PromiseResolver<TResolve | null>[]>;
    nameConflict: Set<string | number | null | undefined>;
  },
] {
  const group = children.get(type);
  const names = new Set<string | number | null | undefined>();
  const resolvers = React.useRef<PromiseResolver<TResolve | null>[]>([]);
  let nameConflict = new Set<string | number | null | undefined>();
  resolvers.current = [];
  baseName = baseName ? `${baseName}.` : "";
  let childClones: React.ReactNode[] | undefined | null = [];

  if (group) {
    childClones = React.Children.map(group, (node) => {
      if (React.isValidElement<TProps>(node)) {
        const key = node.key || startKey.current++;
        const name = `${baseName}${node.props.name || `${key}`}`;
        const resolver =
          allResolvers.get(name) || new PromiseResolver<TResolve | null>();
        allResolvers.set(name, resolver);
        resolvers.current.push(resolver);

        // Allow easy access to the resolver associated with this resource.
        if (node.props.share) {
          node.props.share.current = resolver;
        }

        const props = {
          key,
          name,
          resolver: resolver as PromiseResolver<TResolve | null>,
        } as Partial<TProps & { key: string | number }>;

        if (names.has(props.name)) nameConflict.add(props.name);
        else names.add(props.name);

        return React.cloneElement(node, props);
      }
    });
  }

  return [
    childClones,
    Promise.all(resolvers.current.map((r) => r?.promise)),
    { resolvers, nameConflict },
  ];
}

/**
 * If you use the useChildResolver multiple times, you will end up with several
 * lists of children that need to be put together. This makes that easier.
 */
export function concatChildren(
  ...children: (React.ReactNode[] | undefined | null)[]
) {
  return children
    .filter(isDefined)
    .reduce((a, b) => a.concat(b), [] as React.ReactNode[]);
}
