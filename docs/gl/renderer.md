---
title: WebGL renderer
summary: WebGLRenderer and WebGLStat: context creation, render targets and MRT, the per-model draw sequence, viewport/scissor/readPixels, and hardware capability flags.
covers:
  - ui/src/gl/webgl-renderer.ts
  - ui/src/gl/webgl-stat.ts
related:
  - gl/state-and-proxy.md
  - gl/scene-model-material.md
  - gl/gpu-resources.md
  - surface/render-loop.md
status: complete
verified-at: 5b9f617f
---

## Purpose

`WebGLRenderer` is the single entry point the rest of DeltaV uses to draw: it owns the GL context,
a `GLState` (cached global GL state) and a `GLProxy` (resource compilation and draw calls), and
renders a `Scene` of `Model`s into the screen, one `RenderTarget`, or a list of targets.
`WebGLStat` is a static table of hardware capabilities probed once at module load; the renderer,
proxy, state and many higher layers branch on it (WebGL1 vs WebGL2, MRT, instancing, float
textures).

## Key files

- `ui/src/gl/webgl-renderer.ts` — `WebGLRenderer`, `IWebGLRendererOptions`, `IWebGLRendererState`.
- `ui/src/gl/webgl-stat.ts` — `WebGLStat` (static capability flags, `WebGLStat.print`), `getProgramInfo` (debug dump of a program's active attributes and uniforms).
- `ui/src/util/webgl2-type-shim.ts` — defines a dummy `window.WebGL2RenderingContext` when the browser has none, so `instanceof WebGL2RenderingContext` checks return false instead of throwing. Imported first by `ui/src/index.ts`.

## How it works

### Context setup

`new WebGLRenderer(options)` defaults `alpha`, `antialias`, `preserveDrawingBuffer` to `false`
and calls `getContext()`:

1. `GLProxy.getContext(canvas, attrs)` tries context names in order
   `[WebGLStat.WEBGL_VERSION, "webgl", "webgl2", "experimental-webgl"]` and runs
   `GLProxy.addExtensions` on the first that works.
2. On success: `new GLState(gl, extensions)`, `new GLProxy(gl, glState, extensions)`,
   `glState.setProxy(glProxy)` (the two reference each other), then `glState.syncState()` pushes
   every cached state value to the GPU.
3. On failure: `options.onNoContext()` is called (the `Surface` uses it to abort), else a warning.

`renderer.gl` stays `undefined` without a context and `render`/`readPixels` return immediately.
Setting `renderer.debugContext` forwards a label to both `glProxy` and `glState` for log messages.

### Sizing

`setSize(w, h)` sets `canvas.width/height` to `w|h * pixelRatio` clamped to
`WebGLStat.MAX_TEXTURE_SIZE`, sets CSS size to `w`×`h`, and stores `state.renderSize` (pixels) and
`state.displaySize` (CSS). `setPixelRatio(r)` resizes the canvas from the current display size but
does **not** update `state.renderSize`; the `Surface` calls `setRendererSize` then
`setPixelRatio` (see [Surface](../surface/surface.md)).

### Per-view frame sequence (as driven by `Surface`)

`setRenderTarget(target)` → `setScissor(bounds, target)` → `clearColor(color)` →
`setViewport(bounds)` → `clear(color, depth, stencil)` → `render(scene, target, view, stateChange)`.

- `setViewport`/`setScissor` take top-left-origin bounds and flip Y against the current target
  height (or `renderSize[1]` for the screen) before calling `GLState.setViewport`/`setScissor`.
  `setScissor(undefined)` disables the scissor test.
- `clear()` only **accumulates** a `state.clearMask`; the actual `GLProxy.clear` happens inside the
  next `render()`, after draw buffers are set, and the mask is reset.

### `setRenderTarget(target)`

- Same target as `state.currentRenderTarget` → no-op.
- Array (multi-pass MRT fallback): compiles each target lacking `gl` via
  `GLProxy.compileRenderTarget`; binding happens per pass in `render`.
- Single target: `GLState.useRenderTarget(target)`; if it returns false (FBO not compiled yet), each
  texture of the target is flagged with `GLState.willUseTextureUnit(texture, target)`,
  `GLState.applyUsedTextures()` assigns units and compiles the textures (and the FBO), then
  `compileRenderTarget` + `useRenderTarget` are retried.
- `null` → binds the default framebuffer (screen).

### `render(scene, target, view?, stateChange?)`

1. `setRenderTarget(target)`.
2. Single target with MRT available (`WebGLStat.MRT || WebGLStat.MRT_EXTENSION`):
   `GLState.setDrawBuffers` with every attachment of `target.getGLBuffers()`, so the clear hits all
   color attachments.
3. Apply pending clear mask.
4. Array of targets: for each, `GLState.useRenderTarget`, render **every model** of the scene, then
   blit if the target has `buffers.blit`. Single target / screen: render every model once, then
   blit if configured. Models are visited in `Scene.models` insertion order.
5. Models that failed are removed from the scene (`Scene.remove`).

`renderModel(view, model, toRemove, stateChange)`:

1. `GLState.useMaterial(material)` → `UseMaterialStatus` (compiles the material on first use,
   picks the program matching the render target, sets draw buffers, syncs material state and
   uniforms — see [GL state and proxy](state-and-proxy.md)).
2. `view.props.materialSettings` (if any) is applied on top with `GLState.syncMaterial`; this is
   how a view overrides depth/blend/cull for every layer it draws.
3. `VALID`: `GLProxy.compileGeometry` (creates the VAO once), `prepareAttribute` for each
   attribute (`GLProxy.updateAttribute` uploads dirty data; `GLProxy.useAttribute` sets pointers
   only when the geometry has no VAO), `prepareIndexBuffer` likewise; bind the VAO, or unbind and
   `GLState.applyVertexAttributeArrays()`; call `stateChange(glState, model.id)` (the view's
   `glState` prop) as a last-moment hook; `GLProxy.draw(model)` if all buffers were valid, else
   queue the model for removal; unbind the VAO.
4. `INVALID` (compile/link failure, missing uniforms): model queued for removal.
5. `NO_RENDER_TARGET_MATCHES`: draw skipped silently (debug log only); the model is kept.

### `readPixels(x, y, w, h, out, bufferType = 0)`

Reads RGBA/UNSIGNED_BYTE from the current framebuffer with top-left-origin coordinates, clamped to
the target size. With an array of targets it picks the target whose color buffer `outputType`
equals `bufferType`. Refuses (warns, returns) when the target's `validFramebuffer` is false or when
a single target has more than one color buffer.

### WebGLStat

`initStats()` runs at import: creates a throwaway canvas, tries `webgl2`, `webgl`,
`experimental-webgl` (recording `WEBGL_VERSION`), reads limits (`MAX_TEXTURE_SIZE`,
`MAX_VERTEX_UNIFORMS`, `MAX_FRAGMENT_UNIFORMS`, `MAX_VERTEX_ATTRIBUTES`), probes float texture
read/write by allocating a 2×2 float texture and checking FBO completeness, then:

| Flag | WebGL2 | WebGL1 |
|---|---|---|
| `VAO` | true | `OES_vertex_array_object` |
| `HARDWARE_INSTANCING` | true | `ANGLE_instanced_arrays` |
| `MRT` / `MRT_EXTENSION` | true / false | both = `WEBGL_draw_buffers` |
| `MAX_COLOR_ATTACHMENTS` | `MAX_COLOR_ATTACHMENTS` | from the extension |
| `DEPTH_TEXTURE` | true | `WEBGL_depth_texture` |
| `SHADERS_3_0` | true | false |
| `MSAA_MAX_SAMPLES`, `MAX_UNIFORM_BUFFER_BINDINGS`, `MAX_UNIFORM_BLOCK_SIZE`, `MAX_*_UNIFORM_BLOCKS` | queried | 0 |

It also sets `window.WebGLStat` for console inspection.

## Extension points

- **Low-level rendering without a Surface:** build `Geometry` + `Material` + `Model`, add to a
  `Scene`, call `renderer.render(scene, target)`. `AtlasManager` in
  `ui/src/resources/texture/atlas-manager.ts` does exactly this.
- **Per-view state overrides:** `IViewProps.materialSettings` (applied after each material) and
  `IViewProps.glState(glState, modelId)` (called just before each draw) — both in
  `ui/src/surface/view.ts`.
- **Capability branching:** read `WebGLStat` flags; never assume WebGL2.
- **Debugging:** `renderer.debugContext = "name"`; see `glDebug` and `debugRenderTarget` in
  [GL state and proxy](state-and-proxy.md).

## Gotchas

- `WebGLRenderer.dispose()` is an empty TODO: it frees nothing. Dispose resources individually.
- `WebGLStat` describes a probe context, not necessarily the renderer's context. The renderer asks
  for `WEBGL_VERSION` first so they normally agree.
- In `floatTextureSupport` the half-float probe writes `FLOAT_TEXTURE_READ.full` /
  `FLOAT_TEXTURE_WRITE.full`, so `FLOAT_TEXTURE_READ.half` and `FLOAT_TEXTURE_WRITE.half` always
  stay `false`.
- In the array-of-targets path, a target whose FBO is not compiled makes `render` **return** early:
  remaining targets are skipped and failed models are not removed that frame.
- With an array of targets the whole scene is drawn once per target (cost × N). Single-target MRT
  relies on draw buffers instead and is drawn once.
- `setRenderTarget` short-circuits on identity; if something else bound another FBO through
  `GLState` directly, call `glState.useRenderTarget` yourself.
- `clear()` does nothing until `render()`; clearing without a following render has no effect.
- `readPixels` always reads `RGBA`/`UNSIGNED_BYTE`; `out` must be a `Uint8Array` of
  `w * h * 4`.
- The shim makes `instanceof WebGL2RenderingContext` safe, but must be imported before any GL code
  (`ui/src/index.ts` does it first).

## Related

- [GL state and proxy](state-and-proxy.md) — `GLState`, `GLProxy`, compilation and draw calls.
- [Scene, model and material](scene-model-material.md) — the objects `render` consumes.
- [GPU resources](gpu-resources.md) — attributes, textures, render targets.
- [Render loop](../surface/render-loop.md) — how the `Surface` drives the renderer each frame.
- [Surface](../surface/surface.md) — renderer creation and sizing.
