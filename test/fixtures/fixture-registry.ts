import React from "react";

/** A fixture: a React component rendered by the host page. */
export type FixtureComponent = React.ComponentType<any>;

const registry = new Map<string, FixtureComponent>();

/**
 * Registers a fixture under a unique name. Fixture files
 * (`test/fixtures/**\/*.fixture.tsx`) call this at module load; the host page
 * imports them all eagerly.
 */
export function registerFixture(
  name: string,
  Component: React.ComponentType<any>
) {
  if (registry.has(name)) {
    throw new Error(`Fixture "${name}" is registered twice`);
  }
  registry.set(name, Component as FixtureComponent);
}

export function getFixture(name: string) {
  return registry.get(name);
}

export function fixtureNames() {
  return [...registry.keys()].sort();
}

/**
 * Per-mount hooks the host hands to the mounted fixture. A fixture must call
 * `ready()` once it has drawn its first frame; TestSurface does this for every
 * deltav fixture.
 */
export interface HostContextValue {
  ready(): void;
  fail(error: unknown): void;
}

export const HostContext = React.createContext<HostContextValue>({
  ready() {
    /* no host */
  },
  fail() {
    /* no host */
  },
});
