---
title: Resource management
summary: The resource router and manager base: how a surface registers managers, how pipeline resources are built, and how layer attributes request fonts, atlases, textures and color buffers.
covers:
  - ui/src/resources/base-resource-manager.ts
  - ui/src/resources/resource-router.ts
  - ui/src/resources/index.ts
related:
  - resources/text-and-fonts.md
  - resources/textures-and-atlases.md
  - resources/color-buffers.md
  - surface/surface.md
  - shaders/io-expansion.md
  - react/react-surface.md
status: complete
verified-at: e1093995
---

## Purpose

A resource is a GPU-backed object shared by many layers and instances: a font map, an image atlas,
a render texture or a color buffer. Resources are declared once per surface in the pipeline, built
by a type-specific manager, and consumed by layers through *requests* made from instance attribute
`update` callbacks. The router decouples layers from managers: a layer only knows a resource key and
a request object; the router finds the manager by the numeric resource type.

## Key files

- `ui/src/resources/resource-router.ts` — `ResourceRouter` (type → manager registry, key → type map, request/lifecycle dispatch), `DEFAULT_RESOURCE_ROUTER`.
- `ui/src/resources/base-resource-manager.ts` — `BaseResourceManager<T, S>` abstract base, `BaseResourceOptions`, `BaseResourceRequest`, `InvalidResourceManager`, `INVALID_RESOURCE_MANAGER`.
- `ui/src/resources/index.ts` — re-exports text and texture modules; `RESOURCE` (`createFont`, `createAtlas`, `createTexture`, `createColorBuffer`) and `REQUEST` (`textureRequest`, `atlasRequest`, `fontRequest`, `colorBufferRequest`) helper bags.
- `ui/src/types.ts` — `ResourceType` enum (`ATLAS = 0`, `FONT = 1`, `TEXTURE = 2`, `COLOR_BUFFER = 3`), `IResourceType`, `IResourceContext`, `IResourceInstanceAttribute`, `isResourceAttribute`, `IPipeline.resources`, `TextureSize`.
- `ui/src/surface/surface.ts` — `DEFAULT_RESOURCE_MANAGEMENT`, `ISurfaceOptions.resourceManagers`, `Surface.resourceDiffs`, `Surface.initResources`.

## How it works

### Two kinds of objects

- **Resource options** (`BaseResourceOptions` = `{ type, key }` plus type-specific fields) describe a
  resource to build. Created with `createFont`, `createAtlas`, `createTexture`, `createColorBuffer`
  and passed in `IPipeline.resources`.
- **Requests** (`BaseResourceRequest` = `{ type, key }` plus type-specific fields) ask a manager for
  something inside a built resource (a glyph, an image region, the texture object). Created with
  `fontRequest`, `atlasRequest`, `textureRequest`, `colorBufferRequest`. A manager writes results back
  *onto the request object* (`request.texture`, `request.fontMap`, `request.colorBuffer`), so request
  objects are meant to be kept and reused.

### Manager registration

`Surface.initResources` builds a new `ResourceRouter`, calls `setWebGLRenderer`, then
`setManager(type, manager)` for each entry of `ISurfaceOptions.resourceManagers`, or of
`DEFAULT_RESOURCE_MANAGEMENT()` when that option is absent. The defaults are
`ColorBufferResourceManager` (COLOR_BUFFER), `RenderTextureResourceManager` (TEXTURE),
`AtlasResourceManager` (ATLAS) and `FontResourceManager` (FONT). `setManager` assigns
`manager.router` and `manager.webGLRenderer`. Afterwards `Surface.initIOExpanders` collects
`ResourceRouter.getIOExpansion()` — each manager's `getIOExpansion()` — so managers can add shader
IO (the texture managers add `TextureIOExpansion`, see
[Textures and atlases](textures-and-atlases.md)).

### Resource lifecycle

Resource tags (`TextureJSX`, `ColorBufferJSX`, `FontJSX`, …) inside `SurfaceJSX` become
`pipeline.resources`. `Surface.pipeline(pipeline)` diffs them through `Surface.resourceDiffs`, a
`ReactiveDiff` keyed by `key`, **before** it diffs scenes:

- new key → `ResourceRouter.initResource` → `manager.initResource`
- key present again → `ResourceRouter.updateResource` → `manager.updateResource`
- key gone → `ResourceRouter.destroyResource` → `manager.destroyResource`

`initResource` records `resourceKeyToType[key] = type`; `getResourceType(key)` is how IO expansions
decide whether an attribute's `resource.key()` belongs to them. `Surface.resize` calls
`ResourceRouter.resize()` → every `manager.resize()`. `Surface.destroy` first awaits
`resourceDiffs.destroy()` (`destroyResource` for every live resource, after the scenes are gone),
then calls `ResourceRouter.destroy()`, which destroys every manager and clears both maps. A
manager's `destroyResource` must free the resource's GL objects and forget it (the built-in
managers delete their map entries, including `AtlasManager.destroyAtlas` and
`FontManager.destroyFontMap`), and its `destroy` must tolerate resources already destroyed.
Unmounting a resource tag removes it from the next pipeline (`disposeResource`, see
[React surface](../react/react-surface.md)).

### Request flow

```mermaid
sequenceDiagram
  participant A as Instance attribute update
  participant R as ResourceRouter
  participant M as Manager
  participant S as Surface.draw
  participant I as Instance
  A->>R: this.resource.request(layer, instance, req)
  R->>M: manager.request(...)
  M-->>A: InstanceIOValue (real values, or zeros while pending)
  M->>I: instance.active = false (async managers, pending)
  S->>R: dequeueRequests() after drawing scenes
  R->>M: await manager.dequeueRequests() (sequential)
  M->>I: active = true; nextFrame -> resourceTrigger()
  S->>S: draw again if any manager returned true
```

- A layer's `resource` property is `DEFAULT_RESOURCE_ROUTER` (no managers) until the layer is
  initialised by its surface, which sets `layer.resource = surface.resourceManager`. Views get the
  same router in `LayerScene` (`view.resource`).
- `ResourceRouter.request` picks the manager by `req.type` and returns
  `manager.request(layer, instance, req, context)`. With no manager it warns and returns
  `[-1, -1, -1, -1]`.
- Synchronous managers (texture, color buffer) answer immediately. Asynchronous managers (atlas,
  font) queue the request per resource key, deactivate the instance and return placeholder values.
- At the end of `Surface.draw`, guarded by `isBufferingResources`, the surface awaits
  `ResourceRouter.dequeueRequests()`, which awaits each manager's `dequeueRequests()` in turn and
  ORs their results. `true` triggers an immediate extra `draw`.
- When a queued request is served, the manager sets `instance.active = true` for instances the layer
  still manages (`Layer.managesInstance`) and, on the next frame, calls `instance.resourceTrigger()`.
  The instance re-assigns an observable property so its attribute `update` runs again and now gets
  real values from the populated request.

### Declaring a resource attribute

An instance attribute targets a resource with `resource: { key: () => string, name, shaderInjection? }`
(`IResourceInstanceAttribute`). The matching IO expansion injects a `sampler2D` uniform `name` plus
`name_size`, and defaults the attribute `size` to 4. Its `update` calls
`this.resource.request(this, instance, request)` and returns the result as the attribute value. See
`GlyphLayer` (`ui/src/2d/layers/labels/glyph-layer.ts`) and `ImageRenderLayer`
(`ui/src/2d/layers/images/image-render-layer.ts`) for canonical uses.

## Extension points

- **New resource type**: pick an unused numeric type (not 0–3), subclass
  `BaseResourceManager<TResource, TRequest>` and implement `initResource`, `updateResource`,
  `destroyResource`, `getResource`, `request`, `dequeueRequests` (return `false` if synchronous) and
  `destroy`; optionally override `resize`, `getIOExpansion` and `setAttributeContext`. Register it via
  `ISurfaceOptions.resourceManagers: [...DEFAULT_RESOURCE_MANAGEMENT(), { type, manager }]`.
- **Replacing a default manager**: register another manager for the same type; `setManager` silently
  overrides (only a `debug("performance")` message).
- **Expose a sampler to shaders**: return a `TextureIOExpansion(type, this)` (or your own
  `BaseIOExpansion`) from `getIOExpansion`; the manager must offer
  `getResource(key)` returning an object with `texture`.
- **JSX**: resources are declared as components in the React surface — see
  [React surface](../react/react-surface.md).

## Gotchas

- `DEFAULT_RESOURCE_MANAGEMENT` is a factory: spread `DEFAULT_RESOURCE_MANAGEMENT()`, not the
  function (its doc comment shows the wrong form). Passing `resourceManagers` replaces the defaults
  entirely.
- Resource keys are global across types: `ResourceRouter.initResource` refuses a second resource
  with an existing key (warning, nothing built). `create*` helpers default `key` to `""`; always set
  a key.
- Resources must be in the pipeline before a layer's shader IO is built: `TextureIOExpansion` only
  claims an attribute whose key `getResourceType` already knows. `Surface.pipeline` orders resources
  before scenes for this reason; a resource added later does not add the sampler to existing layers.
- Async results arrive one or more frames later; instances render nothing (inactive) meanwhile.
  An instance class whose attributes use an async resource must override `Instance.resourceTrigger`
  (the base implementation only warns).
- `getManager` returns `INVALID_RESOURCE_MANAGER` (requests yield `[0, 0, 0, 0]`) instead of
  throwing; `request` with no manager returns `[-1, -1, -1, -1]`. Both only warn.
- Managers are instances: one manager object per surface. Do not share a manager instance between
  surfaces (it holds `router` and `webGLRenderer`).

## Related

- [Text and fonts](text-and-fonts.md) — the FONT manager.
- [Textures and atlases](textures-and-atlases.md) — ATLAS and TEXTURE managers, `TextureIOExpansion`.
- [Color buffers](color-buffers.md) — the COLOR_BUFFER manager and render-target outputs.
- [Surface](../surface/surface.md) — pipeline, draw loop and resize that drive the router.
- [IO expansion](../shaders/io-expansion.md) — how expansions turn resource attributes into uniforms.
- [React surface](../react/react-surface.md) — JSX resource components.
