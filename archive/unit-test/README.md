# Archived unit tests

These are the original node-only jest tests of deltav (pure math and data: vectors, matrices,
quaternions, `Transform`, `Projection3D`, `getAbsolutePositionBounds`, `Attribute.repeatInstances`)
and their `jest-setup.ts` `requestAnimationFrame` polyfill.

They are kept for reference only:

- They are **not compiled**: `archive` is not in `tsconfig.json` `include`.
- They are **not run**: jest's `testRegex` only matches `test/**/*.test.ts`.
- Their relative imports (`../ui/src/...`) still point at the old `unit-test/` location, so they
  do not resolve from here without editing.

The current suite lives in `test/`: jest drives headless Chromium, which mounts real deltav scenes
through `SurfaceJSX` and checks rendered pixels against analytically computed expectations. See
[docs/overview/testing.md](../../docs/overview/testing.md).
