---
title: Repository utilities
summary: The generic helpers in the root util folder, which few the library imports (useLifecycle, normalizeWheel, isString), and their traps.
covers:
  - util
related:
  - overview/repository.md
  - utilities/library-util.md
  - react/react-surface.md
status: complete
verified-at: 2386e418
---

## Purpose

Root `util/` is a grab-bag of framework-agnostic browser, React and data helpers shared by the
library, the Storybook stories and tooling. Only four modules are reached from `ui/src`; the rest
are available for stories and new code but unused by the library. Check here (and in
[Library utilities](library-util.md)) before writing a new generic helper. Nothing in root
`util/` is re-exported from the package entry `ui/src/index.ts`.

## Key files

What `ui/` imports from root `util/` (found by resolving every relative import under `ui/`):

| Module | Imported by |
|---|---|
| `util/hooks/use-life-cycle.ts` (`useLifecycle`, `ILifecycle`) | every JSX component of the React surface in `ui/src/base-surfaces/react-surface` (surface, scene, layer, view, resources, event managers) and many stories |
| `util/normalize-wheel/index.ts` (`normalizeWheel`) | `ui/src/util/mouse.ts`, used by `UserInputEventManager.makeWheel` |
| `util/types.ts` (`isString`) | `ui/src/base-surfaces/react-surface/scene/view-jsx.tsx` |
| `util/hooks/use-force-update.ts` (`useForceUpdate`) | `ui/stories/components/draw-tool/draw-tool.stories.tsx` only |

Transitively the library also loads `util/promise-resolver.ts` and `util/no-op.ts` (via
`useLifecycle`) and the rest of `util/normalize-wheel/`.

All other modules, by group (none imported by `ui/`):

| Group | Files | Symbols |
|---|---|---|
| Types and guards | `util/types.ts` | `IJson`, `IJsonType`, `IJsonArray`, `IChildren`, `IPropsChildren`, `INestedChildren`, `GenericFunction`, `FlowType`, `isString`, `isNumber`, `isFunction`, `isDefined`, `isTruthy` |
| Async / timing | `util/promise-resolver.ts`, `util/wait.ts`, `util/rush.ts`, `util/debounce.ts`, `util/profiler.ts`, `util/no-op.ts` | `PromiseResolver` (with `hijack`), `wait`, `rush`, `debounce`, `throttle`, `throttledLog`, `startProfile`/`endProfile`/`flushProfile`, `NOOP` |
| Objects / arrays | `util/deep-clone.ts`, `util/deep-equal.ts`, `util/pick.ts`, `util/flatten-array.ts`, `util/compare-sets.ts`, `util/get-index.ts`, `util/make-buffer.ts`, `util/look-up.ts`, `util/map-lookup-values.ts` | `deepClone`, `deepEqual`, `pick`, `strictPick`, `flattenArray`, `compareSets`, `getIndex`, `MakeBuffer.map`/`MakeBuffer.init`, `Lookup`, `mapLookupValues` |
| Strings / numbers / URLs | `util/template.ts`, `util/to-query-params.ts`, `util/url-join.ts`, `util/get-domain.ts`, `util/to-digits.ts`, `util/get-decimal.ts`, `util/fuzzy-groups.ts`, `util/chalk.ts`, `util/classnames.ts`, `util/cva.ts`, `util/get-error-message.ts`, `util/headers-to-record.ts`, `util/cookie-parser.ts` | `template`, `toQueryParams`, `tokenizeQueryParams`, `urlJoin`, `getDomain`, `toDigits`, `getDecimal`, `fuzzyGroups`, `isFuzzyGroupResult`, `chalk` (ANSI colours), `classnames`, `cva`, `cvaOptionsToStorybook`, `getErrorMessage`, `headersToRecord`, `cookieParser` |
| DOM | `util/event-element-position.ts`, `util/clone-client-rect.ts`, `util/compare-client-rect.ts`, `util/relative-client-rect.ts`, `util/get-first-with-class.ts`, `util/has-child.ts`, `util/get-selected-text.ts`, `util/copy-text-to-clipboard.ts`, `util/ensure-modal-root.ts`, `util/window-focus-event.ts`, `util/add-font.ts`, `util/stop-propagation.ts`, `util/stop-all-propagation.ts`, `util/normalize-wheel/` | `eventElementPosition`, `cloneClientRect`, `compareClientRect`, `relativeClientRect`, `getFirstWithClass`, `hasChild`, `getSelectedText`, `copyTextToClipboard`, `ensureModalRoot`, `windowFocusEvents`, `addFont`/`destroyAllFonts`, `stopPropagation` (two files), `normalizeWheel` |
| React | `util/filter-react-children.ts`, `util/group-react-children.ts`, `util/get-react-node-children.ts`, `util/state-controls.ts`, `util/hooks/` | `filterReactChildren`, `groupReactChildren`, `getReactNodeChildren`, `controlHover`/`controlMouseDown`/`controlFocus`, `useLifecycle`, `useForceUpdate`, `useMediaQuery`/`orientation`/`Breakpoints`, `useSetState` |
| Storybook | `util/storybook-containers/center.tsx`, `util/storybook-containers/fill-page.tsx` | `Center`, `FillPage` |

## How it works

### useLifecycle

`useLifecycle(target, remount?)` lets a plain store object follow a component's lifecycle and
returns `{ store, shouldMount }`. On the first render `target.willMount()` decides `shouldMount`.
After mount, every render calls `target.willUpdate()`; a returned async function runs after that
render. `didMount()` runs in a `useEffect` (it may be async and may return an unmount callback);
the effect cleanup waits for `didMount` to finish (a `PromiseResolver`) before calling the unmount
callback. When `remount` deps change after mount, `willMount` runs again. The React surface
components use it to create and dispose their DeltaV objects; see
[React surface](../react/react-surface.md).

### normalizeWheel

A port of Facebook's wheel normaliser: from `detail`, `wheelDelta*`, `deltaX/Y` and `deltaMode`
it returns `{ spinX, spinY, pixelX, pixelY }` (line units × 40, page units × 800, legacy spin × 10
pixels). `normalizeWheel.getEventType()` names the best event (`DOMMouseScroll`, `wheel` or
`mousewheel`). `UserInputEventManager.makeWheel` reports `[pixelX, pixelY]` as the wheel delta.

## Extension points

- Add a helper as one file exporting named functions; the library imports with relative paths
  ending in `.js` (e.g. `../../../util/normalize-wheel/index.js`). There is no barrel file.
- Before making `ui/src` import a new root `util/` module, check its imports: `util/cva.ts`
  depends on `class-variance-authority` and several files depend on `react`, which the core
  library otherwise does not need outside the React surface.

## Gotchas

- `normalizeWheel` negates the Y axis: it returns `spinY: -sY` and `pixelY: -pY`, so a
  `deltaY > 0` wheel event yields a negative `pixelY`. Camera controllers receive this sign.
- Duplicated helpers (some behave differently): `util/promise-resolver.ts` vs
  `ui/src/util/promise-resolver.ts` (root has `hijack`), `util/wait.ts` vs `ui/src/util/wait.ts`,
  `util/event-element-position.ts` vs `ui/src/util/mouse.ts`, `util/types.ts` `isDefined` vs
  `ui/src/util/common-filters.ts`, `util/look-up.ts` vs `util/map-lookup-values.ts` (the latter
  splits dotted keys), and `stopPropagation` in both `util/stop-propagation.ts` and
  `util/stop-all-propagation.ts`. Inside `ui/src` prefer the `ui/src/util` version.
- `deepClone` claims to handle circular references but does not track visited objects: a cycle
  recurses until stack overflow. It creates copies by calling `obj.constructor()` without `new`,
  so it works for plain objects and arrays but throws on class instances.
- `useLifecycle` with no `remount` uses `[0]` as the deps; `willUpdate` runs during render, so it
  must not set React state synchronously.
- `util/types.ts.copy` is a stray copy of `util/types.ts` with extra strict-type helpers; nothing
  imports it.
- `cookieParser` and the DOM helpers touch `document`/`window` and fail outside a browser
  (`cookieParser` needs an argument in Node).

## Related

- [Library utilities](library-util.md) — `ui/src/util`, the library's own helpers.
- [Repository layout and tooling](../overview/repository.md) — where root `util/` sits in the repo.
- [React surface](../react/react-surface.md) — the components built on `useLifecycle`.
