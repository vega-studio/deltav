---
title: React surface
summary: SurfaceJSX and its child tags (ViewJSX, LayerJSX, SceneJSX, resource and event-manager JSX): how React children resolve to a Surface pipeline, naming, lifecycle and limits.
covers:
  - ui/src/base-surfaces/react-surface/surface-jsx.tsx
  - ui/src/base-surfaces/react-surface/scene
  - ui/src/base-surfaces/react-surface/resource
  - ui/src/base-surfaces/react-surface/event-managers
related:
  - react/post-processing.md
  - surface/surface.md
  - surface/views-and-scenes.md
  - surface/layer.md
  - resources/textures-and-atlases.md
  - resources/color-buffers.md
  - interaction/event-management.md
status: complete
verified-at: 4e02f8b7
---

## Purpose

`SurfaceJSX` is the only way to build a deltav surface: a React app declares the surface and its
pipeline (resources, event managers, scenes, views, layers) as JSX, and `SurfaceJSX` constructs
the internal `Surface` and calls `Surface.pipeline(...)` for it. The package exports `Surface` as
a type only, for the instance `SurfaceJSX` hands to its `ready` resolver. The child tags render no DOM of their own; each one builds a
deltav object (a `LayerInitializer`, `ViewInitializer`, `ISceneOptions`, resource options or an
`EventManager`) and hands it up to the surface through a `PromiseResolver`. Everything is exported
from the package root via `ui/src/base-surfaces/index.ts`.

## Key files

- `ui/src/base-surfaces/react-surface/surface-jsx.tsx` — `SurfaceJSX`, `ISurfaceJSX` (props), `SurfaceContext`, `ISurfaceContext`.
- `ui/src/base-surfaces/react-surface/group-surface-children.ts` — `SurfaceJSXType` enum, `groupSurfaceChildren` (sorts children by tag type, flattening fragments).
- `ui/src/base-surfaces/react-surface/use-child-resolver.ts` — `IResolverProvider`, `useChildResolvers`, `concatChildren`.
- `ui/src/base-surfaces/react-surface/custom-tag.tsx` — `CustomTag`: optional debug DOM element per tag (`writeToDom`).
- `ui/src/base-surfaces/react-surface/use-share-ref.ts` — `useShareResource` (a typed `useRef` for the `share` prop; not re-exported by the package index).
- `ui/src/base-surfaces/react-surface/scene/layer-jsx.tsx` — `LayerJSX`, `ILayerJSX`, `LayerConfig`.
- `ui/src/base-surfaces/react-surface/scene/view-jsx.tsx` — `ViewJSX`, `IViewJSX`, `IPartialViewJSX` and the `output` → `ViewOutputBuffers` mapping.
- `ui/src/base-surfaces/react-surface/scene/scene-jsx.tsx` — `SceneJSX`, `ISceneJSX`.
- `ui/src/base-surfaces/react-surface/scene/as-layer.tsx`, `as-view.tsx`, `as-scene.tsx` — `ILayerBaseJSX`, `IViewBaseJSX`, `ISceneBaseJSX` base prop interfaces.
- `ui/src/base-surfaces/react-surface/resource/` — `TextureJSX`, `AtlasJSX`, `FontJSX`, `ColorBufferJSX`, `DepthBufferJSX`, `FloatTextureJSX`, `IResourceJSX`.
- `ui/src/base-surfaces/react-surface/event-managers/` — `SimpleEventHandlerJSX`, `QueuedEventHandlerJSX`, `BasicCamera2DControllerJSX`, `Simple3DTransformControllerJSX`, `IEventManagerJSX`.

## How it works

### Tag identity and grouping

Every tag component carries a static `surfaceJSXType` (`SurfaceJSXType.EVENT_MANAGER`, `LAYER`,
`RESOURCE`, `VIEW`, `SCENE`; `CAMERA` and `PROVIDER` exist in the enum but no tag uses them).
`groupSurfaceChildren(children)` walks the children depth-first: an element whose type has
`surfaceJSXType` goes into that type's group; a `React.Fragment` or any element *without*
`surfaceJSXType` is descended into through its `props.children`; an untyped element with no
children is dropped (`SurfaceJSX` logs "Surface found unsupported children").

### Resolvers

`useChildResolvers(allResolvers, groups, type, startKey, baseName)` runs during render. For each
child of the group it:

1. computes `name = baseName ? "<baseName>.<props.name || key>" : "<props.name || key>"`, where
   `key` is the element key or an auto-incremented counter shared across the calls of one parent;
2. reuses or creates a `PromiseResolver` in `allResolvers` under that name, and writes it into
   `props.share.current` when a `share` ref is given;
3. clones the child with `{ key, name, resolver }` and reports duplicate names in `nameConflict`.

It returns the clones, `Promise.all` of the resolvers' promises, and `{ resolvers, nameConflict }`.
Each tag component resolves its `resolver` in `useLifecycle.didMount` with the object it built.

`SurfaceJSX` holds one resolver map per kind (`eventResolvers`, `resourceResolvers`,
`viewResolvers`, `layerResolvers`, `sceneResolvers`) and exposes them through `SurfaceContext`,
together with `writeToDom`, `updatePipeline()` and the unmount handlers `disposeLayer(layerInit)`,
`disposeView(viewInit)`, `disposeScene(scene)` and `disposeResource(resource)`. Each removes the
initializer it was given from the tracked scenes or resources and re-pipelines; each does nothing
once the surface is gone.

### Mount sequence (`SurfaceJSX`)

1. Render: group children; resolve event managers, resources, scenes, root layers and root views
   with `useChildResolvers`. A name conflict at the root logs a warning and renders nothing.
2. The cloned children render inside a `<canvas>` under `SurfaceContext.Provider` (they produce
   no DOM unless `writeToDom`).
3. `didMount` awaits all five resolver promises in parallel, filters `null`s, and requires either
   a scene or both root layers and root views. Root layers + views become a scene keyed `"root"`
   (unshifted first).
4. `new Surface({ context: canvas, handlesWheelEvents (default true), pixelRatio (default
   window.devicePixelRatio), eventManagers, ioExpansion, shaderTransforms, resourceManagers,
   optimizedOutputTargets, rendererOptions: { alpha: true, antialias: false, ...options } }).ready`.
5. Starts `onAnimationLoop(draw, frameRate ? 1000 / frameRate : undefined)`; `draw` calls
   `Surface.draw(time)` unless `stop` is set, and stops the loop once
   `surface.frameMetrics.currentFrame >= renderFrameCount`.
6. `await Surface.pipeline({ resources, scenes })`, `await onFrame()`, size the canvas to the
   container (`Surface.resize(offsetWidth, offsetHeight)`), then `ready?.resolve(surface)`.
7. A `window` resize listener re-fits (debounced through `setTimeout`).

After every `await` in steps 3–6 `didMount` checks an `unmounted` ref (set by an effect cleanup
that also clears the pending resize timeout). Unmounted before the surface exists → it returns
without creating anything; unmounted later → it skips the remaining steps and returns its
teardown, which `useLifecycle` runs as soon as `didMount` settles.

### Unmount sequence

The teardown `didMount` returns runs on unmount (after `didMount` finished, see
`useLifecycle`): remove the resize listener, clear the resize timeout, stop the animation loop,
`await Surface.destroy()` (scenes, resources, renderer and GL context; see
[Surface](../surface/surface.md)), then drop the surface reference. If the surface's `ready`
rejects (no WebGL context) the teardown runs and `didMount` rethrows. Each tag also returns a
cleanup from its `didMount` that calls its `dispose*` handler; during a full unmount those are
no-ops or re-pipelines that the destroying surface ignores.

### The tags

- **`LayerJSX`** — props `type` (layer class with `defaultProps`), `config` (layer props, `key`
  and `data` optional), `name`, `providerRef`, `uses`. On mount it builds
  `createLayer(type, { key: name, ...config })`. Provider choice: `providerRef.current` if set,
  else `config.data`; if that is the class's shared `defaultProps.data`, a fresh
  `InstanceProvider` is created. The chosen provider is written back into `providerRef.current`,
  so the ref is both an input and an output. `uses: { names, apply(resources, config) }` waits for
  the named resources (looked up in `resourceResolvers`, each must pass
  `isRenderTextureResource`) and lets `apply` inject them into the config before the layer is
  created. A `useEffect` keyed on `Object.values(config)` merges the new config into
  `layer.init[1]` and calls `updatePipeline()`. Unmount calls `disposeLayer`, which splices the
  initializer out of every tracked scene and re-pipelines.
- **`ViewJSX`** — props `type` (view class), `config` (view props without `output`/`chain`),
  `name`, `output`. `output` is `{ buffers: Record<outputType, resourceName | undefined>, depth:
  resourceName | boolean, blit?: { color?, depth? } }` or an array of them. Each resource name is
  awaited from `resourceResolvers` and must be a render texture or color buffer (depth blit: render
  texture only). The first entry becomes the view's `output`, the rest become `chain` entries.
  Then `createView(type, { key: name, ...config, output, chain })`. Unmount calls `disposeView`
  (splices it out of every tracked scene's `views`).
- **`SceneJSX`** — `name` (required), children `ViewJSX`/`LayerJSX` only. Its children's names are
  prefixed `"<sceneName>."`; it resolves `{ key: name, layers, views }`. Unmount calls
  `disposeScene` (removes it from the tracked scenes).
- **Resources** — `TextureJSX` (`createTexture`), `AtlasJSX` (`createAtlas`), `FontJSX`
  (`createFont`), `ColorBufferJSX` and `DepthBufferJSX` (both `createColorBuffer`, with `config`
  as `colorBufferSettings`; they differ only in the allowed `internalFormat` type),
  `FloatTextureJSX` (`createTexture` with float `internalFormat` per `channels`, nearest filtering,
  clamp wrapping; falls back to half float when `WebGLStat.FLOAT_TEXTURE_READ/WRITE.full` is
  false). The resource `key` is the tag's `name`. Unmount calls `disposeResource` (removes it from
  the tracked resources, so the next pipeline destroys it).
- **Event managers** — `SimpleEventHandlerJSX` (`new SimpleEventHandler(handlers)`),
  `QueuedEventHandlerJSX` (`new QueuedEventHandler(handlers, preserveEvents)`),
  `BasicCamera2DControllerJSX` (`new BasicCamera2DController(config)`; `disabled` and
  `disableDragPanning` stay live via `useEffect`), `Simple3DTransformControllerJSX`
  (`new Simple3DTransformController(config)`).

### Minimal usage

```tsx
<SurfaceJSX ready={ready.current}>
  <ViewJSX name="main" type={View2D} config={{ camera: new Camera2D() }} />
  <LayerJSX type={CircleLayer} providerRef={circleProvider} config={{}} />
</SurfaceJSX>
```

Working examples: `ui/stories/components/2d/circle.stories.tsx` (root view + layer, `ready`,
`providerRef`), `ui/stories/components/multi-render-target.stories.tsx` (scenes, textures as
render targets, `output`, post-processing).

## Extension points

- **New tag**: write a component whose props extend `Partial<IResolverProvider<T>>` (or one of
  `ILayerBaseJSX`, `IViewBaseJSX`, `ISceneBaseJSX`, `IResourceJSX`, `IEventManagerJSX`), call
  `props.resolver?.resolve(value)` once in `useLifecycle({ didMount })`, render
  `<CustomTag tagName="..." {...props} />`, and set `MyTag.surfaceJSXType = SurfaceJSXType.<KIND>`.
  Without the static, the surface ignores the element.
- **Composite helpers**: a plain function returning `SceneJSX`/`ViewJSX`/`LayerJSX` elements
  (as `PostProcessJSX` and `CommandsJSX` do) can be called inline as `{Helper({...})}`; see
  [Post processing](post-processing.md).
- **Surface options**: `ioExpansion`, `shaderTransforms`, `resourceManagers`,
  `optimizedOutputTargets` pass straight to `ISurfaceOptions`; `options` is
  `ISurfaceOptions["rendererOptions"]`.
- **Accessing the Surface**: pass `ready={new PromiseResolver<Surface>()}` and await
  `ready.promise`; it resolves after the first pipeline and resize.
- **Sharing a resolver**: `share={ref}` on any tag puts its `PromiseResolver` in `ref.current`.

## Gotchas

- **The pipeline structure is fixed at mount.** `SurfaceJSX.didMount` runs once; tags added later
  get resolvers but are never added to the tracked scenes. Only unmounts of layers, views, scenes
  and resources (`dispose*`) and `LayerJSX` config changes (`updatePipeline`) propagate. `ViewJSX`,
  `SceneJSX`, resources and event managers read their props only on mount (except the two live
  `BasicCamera2DControllerJSX` flags), and a remounted tag with the same name reuses its already
  resolved resolver, so it is not re-added. To change structure, remount `SurfaceJSX` (change its
  `key`).
- `LayerJSX`'s update effect depends on `Object.values(config)`: inline objects/arrays in `config`
  (e.g. `animate: {...}`) are new every render and re-pipeline on every parent render; the
  dependency array length also changes if keys are added or removed.
- Resources and event managers must be direct children of `SurfaceJSX` (or nested in fragments /
  untyped wrappers); `SceneJSX` only collects layers and views.
- Names are prefixed inside a scene (`"scene.layer"`), so layer/view keys differ from the `name`
  you wrote; resource names are not prefixed and are what `uses.names` and `output` refer to.
  Duplicate names in one parent abort the render (surface) or resolve the scene to `null`.
- Root layers without root views (or the reverse) are dropped silently; with no scenes either,
  `SurfaceJSX` logs "No scenes or root level Layers+Views provided to surface" and never creates
  the surface.
- `LayerJSX` and `ViewJSX` `await surfaceContext.resolversReady`, which is a `PromiseResolver`
  object (not its `.promise`) and is never resolved; the `await` is only a microtask yield. Lookups
  work because all resolvers are registered during the parent's render, before any `didMount`.
- `ISurfaceJSX.optimizedOutputTargets` mentions `enableOutput`; the real method is
  `Surface.enableOptimizedOutput(output)`, valid for the next draw only.
- `FloatTextureJSX` warns when `data.length < width * height * channels`.
- `CustomTag` only emits DOM when `writeToDom` is true, JSON-stringifying props as lowercase
  attributes; `DepthBufferJSX` reports as `ColorBuffer` and `Simple3DTransformControllerJSX` as
  `BasicCamera2DController` in that debug DOM.
- The container `div` gets class `SurfaceJSX` (`surface-jsx.css`: flex, 100% width/height,
  `overflow: hidden`); the canvas is sized from the container's `offsetWidth/offsetHeight`, so a
  zero-size container yields a zero-size canvas.

## Related

- [Post processing](post-processing.md) — `PostProcessJSX` and effect helpers built from these tags.
- [Surface](../surface/surface.md) — the `Surface` that `SurfaceJSX` constructs and drives.
- [Views and scenes](../surface/views-and-scenes.md) — view `output`, `chain` and draw modes.
- [Layer](../surface/layer.md) — `createLayer`, layer props and providers.
- [Textures and atlases](../resources/textures-and-atlases.md) and [Color buffers](../resources/color-buffers.md) — the resources behind the resource tags.
- [Event management](../interaction/event-management.md) — the event managers the event tags create.
