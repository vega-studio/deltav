---
title: Utility layers
summary: debugLayer and the internal LogChangesLayer: wrap a layer to log the instance changes it receives and its shader IO, for debugging only.
covers:
  - ui/src/util-layers
related:
  - react/post-processing.md
  - surface/layer.md
  - instances/instance-providers.md
  - buffers/instance-diffing.md
status: complete
verified-at: 2eeb963a
---

## Purpose

`ui/src/util-layers` holds debugging layers that are not drawing primitives. Today it has one:
`LogChangesLayer`, reached through `debugLayer(...)`, a drop-in replacement for `createLayer` that
wraps a layer, renders it unchanged as a child layer, and logs to the console every batch of
instance changes flowing into it plus the shader IO the wrapped layer (and its children) declare.

## Key files

- `ui/src/util-layers/log-changes-layer.ts` — `debugLayer` (exported), `LogChangesLayer` and `ILogChangesLayerProps` (module-private).
- `ui/src/util-layers/index.ts` — re-exports the module; the package root re-exports `ui/src/util-layers` from `ui/src/index.ts`.

## How it works

`debugLayer(layerClass, props)` has the same signature as `createLayer` and returns
`createChildLayer(LogChangesLayer, { messageHeader, wrap: createChildLayer(layerClass, props),
data: props.data })`. `messageHeader` returns `"CHANGES FOR: <key>"` using the initializer's key.

`LogChangesLayer` (extends `Layer`):

- **constructor** — `console.warn("Please ensure all debugLayer calls are removed for
  production:", key)`.
- **`childLayers()`** — sets the wrapped initializer's key to `debug-wrapper.<key>` and returns it,
  so the surface instantiates and renders the real layer as a child sharing the same provider.
- **`draw()`** — overrides `Layer.draw`: calls `this.resolveChanges(true)` (reads
  `props.data.changeList` *without* resolving the provider, so the child layer still receives the
  same changes) and, when non-empty, `console.warn`s `{ totalChanges, changes }` under the header.
- **`initShader()`** — constructs a throwaway instance of the wrapped layer class, walks its
  `childLayers()` tree, constructs each and calls `initShader()` on it, then logs
  `Shader IO: <id>` with the wrapped layer's and children's shader initialization. Returns `null`,
  so `LogChangesLayer` itself renders nothing.

Usage, inside a pipeline's `layers` list:

```ts
layers: [debugLayer(CircleLayer, { key: "circles", data: provider })]
```

With `LayerJSX`, there is no `debugLayer` equivalent prop; use it in imperative
`Surface.pipeline` scenes.

## Extension points

- New utility layers go in `ui/src/util-layers/` and must be exported from
  `ui/src/util-layers/index.ts` to reach the package root.
- The pattern used here — a parent layer that returns child initializers from `childLayers()`,
  overrides `draw()` and returns `null` from `initShader()` — is the general way to build a
  non-rendering wrapper layer; see [Layer](../surface/layer.md).

## Gotchas

- Debug only: it logs on every frame that has changes and constructs extra layer instances in
  `initShader` (their constructors run and their `initShader` side effects happen, e.g. a layer
  that adds instances to its provider there will do so twice).
- Both the wrapper and the wrapped child use the same `data` provider; the wrapper reads with
  `resolveChanges(true)` (no `provider.resolve`), leaving the provider's resolution to the child.
- `LogChangesLayer` is not exported; only `debugLayer` is. The wrapped layer's key is rewritten to
  `debug-wrapper.<key>`, so lookups by the original key find the wrapper, not the drawing layer.

## Related

- [Layer](../surface/layer.md) — `createLayer`, `createChildLayer`, `childLayers`, `resolveChanges`.
- [Instance providers](../instances/instance-providers.md) — the `changeList` being logged.
- [Instance diffing](../buffers/instance-diffing.md) — how the child layer consumes those changes.
- [Post processing](post-processing.md) — the other helper layers (`PostProcessLayer`).
