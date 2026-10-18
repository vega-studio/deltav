---
title: GL state and proxy
summary: GLState caches global GL state to skip redundant calls; GLProxy lazily compiles, uploads, draws and disposes GL objects; GLSettings/gl-decode map enums to GL constants; debug helpers.
covers:
  - ui/src/gl/gl-state.ts
  - ui/src/gl/gl-proxy.ts
  - ui/src/gl/gl-settings.ts
  - ui/src/gl/gl-decode.ts
  - ui/src/gl/gl-debug.ts
  - ui/src/gl/debug-resources.ts
related:
  - gl/renderer.md
  - gl/gpu-resources.md
  - gl/scene-model-material.md
status: complete
verified-at: 4098986b
---

## Purpose

All WebGL calls in DeltaV go through two objects created by `WebGLRenderer.getContext`.
`GLState` mirrors the context's global state (bindings, enables, blend/depth/cull, viewport,
scissor, texture units, draw buffers, current program) and only issues a GL call when the requested
value differs. `GLProxy` turns framework objects (`Attribute`, `IndexBuffer`, `Geometry`,
`Material`, `Texture`, `RenderTarget`, `ColorBuffer`) into GL objects on first use, uploads their
dirty data, issues draw calls and deletes them. `GLSettings` is the framework's enum vocabulary;
`gl-decode.ts` converts it to GL constants for the active context version.

## Key files

- `ui/src/gl/gl-state.ts` — `GLState`: state cache, `useMaterial`, `useRenderTarget`, `syncMaterial`, texture unit allocation.
- `ui/src/gl/gl-proxy.ts` — `GLProxy`: `getContext`, `addExtensions`, `compile*`, `update*`, `use*`, `draw`, `dispose*`, `blitFramebuffer`, `printError`.
- `ui/src/gl/gl-settings.ts` — `GLSettings` namespace: `RenderTarget.*BufferFormat`, `Material.*` (blending, depth, cull), `Model.DrawMode`, `Texture.*` (filters, wrapping, formats, alignment), `Renderer.*`.
- `ui/src/gl/gl-decode.ts` — `drawMode`, `texelFormat`, `inputImageFormat`, `magFilter`, `minFilter`, `colorBufferFormat`, `depthBufferFormat`, `stencilBufferFormat`, `wrapMode`, `indexToColorAttachment`, `indexToTextureUnit`, `textureUnitToIndex`.
- `ui/src/gl/gl-debug.ts` — `glDebug(gl, stopOnError)`: a `Proxy` around the context that calls `getError()` after every method.
- `ui/src/gl/debug-resources.ts` — `debugRenderTarget`, `debugTexture`, `debugReadPixels`, `flushDebug`: copy a target/texture to an on-page canvas.

## How it works

### Lazy compilation pattern

Every resource has an optional `gl` field. `undefined` means "not on the GPU yet"; the proxy's
`compileX` creates the GL object and fills `gl` (always including `proxy: this`, so the resource's
own `destroy()` can call back `proxy.disposeX`). `disposeX` deletes the GL object and `delete`s
`gl`, so the next use recompiles. `rebuild()` on resources is just `disposeX`.

| Resource | Compile | Update (dirty flags) | Use / bind |
|---|---|---|---|
| `Attribute` | `compileAttribute` (`bufferData`, `DYNAMIC_DRAW`/`STATIC_DRAW` from `isDynamic`) | `updateAttribute`: full `bufferData` if `fullUpdate` or range < 0, else `bufferSubData` of `updateRange` (offset × 4 bytes); then `resolve()` | `useAttribute(name, attr, geometry)` |
| `IndexBuffer` | `compileIndexBuffer` (index type from the typed array class) | `updateIndexBuffer` | `useIndexBuffer` |
| `Geometry` | `compileGeometry` (creates VAO and records attribute pointers into it) | — | `GLState.bindVAO` |
| `Material` | `compileMaterial` | uniforms each `syncMaterial` | `GLState.useMaterial` |
| `Texture` | `compileTexture` (needs a texture unit first) | `updateTexture` → data, partial regions, settings | `GLState.bindTexture` |
| `RenderTarget` | `compileRenderTarget` (+ `compileBlitTargets`) | — | `GLState.useRenderTarget` |
| `ColorBuffer` | `compileColorBuffer` / `compileDepthBuffer` (renderbuffer storage, multisampled on WebGL2) | — | attached to an FBO |

### Shader program cache

`compileMaterial` caches compiled shaders by **source text** (`vertexShaders`, `fragmentShaders`
maps) and programs per (vertex shader, fragment shader) pair with a `useCount`. A material has one
vertex shader and a `MaterialFragmentShader` map (render target → `{source, outputTypes}`); one
program is linked per fragment shader and recorded in `material.gl.programId[]` with its
`outputTypes`. After linking it collects active uniform names (stripping `[0]`), **deletes material
uniforms the programs do not use**, and returns false if counts still differ.
`disposeMaterial` decrements `useCount`, deleting the program at zero, the vertex shader when it has
no programs left, and a fragment shader when no vertex shader references it.

### `GLState.useMaterial(material)`

1. Compile if `material.gl` is missing; `INVALID` on failure or no programs.
2. `findMaterialProgram`: for the screen or a single-COLOR target
   (`RenderTarget.isColorTarget`) choose the program with the fewest outputs that includes
   `FragmentOutputType.COLOR`; otherwise the program matching the most of the target's output
   types (ties → fewest outputs), cached in `material.gl.programByTarget`. None →
   `NO_RENDER_TARGET_MATCHES`.
3. With a render target and draw-buffer support: build the draw-buffer list, one entry per target
   color buffer — its attachment if the program writes that `outputType` and it is not in
   `RenderTarget.disabledTargets`, else `gl.NONE` — then `setDrawBuffers`.
4. `useProgram`, then `syncMaterial(material)`.

`syncMaterial(settings)` sets depth mask/test/func, blending, cull, color mask, dithering (each
skipped when unchanged), then uniforms: the location is looked up per program and cached in
`uniform.gl` (a `Map<WebGLProgram, {location}>`), and `uploadUniform` dispatches on
`MaterialUniformType`. `TEXTURE` uniforms only call `willUseTextureUnit`; at the end
`applyUsedTextures()` assigns units, compiles/updates textures and calls `uniform1i`.

### Texture units

`GLState` builds a free list of `MAX_COMBINED_TEXTURE_IMAGE_UNITS` units. A texture keeps its unit
in `texture.gl.textureUnit` (`-1` = none). `assignTextureUnits` gives free units first, then steals
units from textures not needed by the next draw (logs a debug warning: swapping every frame is
slow). Textures that still get no unit fall back to `TEXTURE0`/sampler 0. `useRenderTarget` calls
`freeTextureUnit` on every texture the target renders into, to avoid feedback loops.

### Vertex attribute arrays

Without a VAO, `useAttribute` calls `willUseVertexAttributeArray(location)` (enables immediately)
and `setVertexAttributeArrayDivisor` (1 when both geometry and attribute are instanced, else 0);
`applyVertexAttributeArrays` then disables locations not flagged. Attributes with `size > 4` span
`ceil(size / 4)` consecutive locations with stride `blocks * 16` bytes (matrices).

### Draw

`GLProxy.draw(model)`: range = `vertexDrawRange` if both entries ≥ 0 (`[start, end - start]`),
else `[0, model.vertexCount]`. Instanced (`drawArraysInstanced`/`drawElementsInstanced`, or the
`ANGLE` variants) only when `model.drawInstances >= 0` **and** `geometry.isInstanced` **and** the
instancing extension exists. With MRT and a render target, the draw is skipped when the target has
no depth buffer and every draw buffer is `NONE`. Afterwards `setDrawBuffers([], true)` invalidates
the draw-buffer cache without a GL call.

### WebGL1 vs WebGL2

`GLProxy.addExtensions` returns `IExtensions`: for WebGL2 `instancing`, `drawBuffers`, `vao`,
`floatTex*`, `halfFloatTex*` are the context itself; for WebGL1 they are the extension objects
(`ANGLE_instanced_arrays`, `WEBGL_draw_buffers`, `OES_vertex_array_object`, ...). Call sites
branch with `instanceof WebGL2RenderingContext` (`bindVertexArray` vs `bindVertexArrayOES`,
`drawBuffers` vs `drawBuffersWEBGL`, `vertexAttribDivisor` vs `vertexAttribDivisorANGLE`).
WebGL2-only features: multisampled renderbuffers, `blitFramebuffer`/`bindFBOTargets`, the
WebGL2 entries of the format decoders (others fall back to `RGBA4` / `DEPTH_COMPONENT16`).

### Debugging

- `glDebug(gl, true)` wraps a context; the hook is a commented-out line in `GLProxy.getContext`.
- `debugRenderTarget(renderer, target, defer)` reads the target into an overlay canvas
  (`#__debug_read_pixels__`); with `defer` it is queued until `flushDebug()`.
- `getProgramInfo` (in `ui/src/gl/webgl-stat.ts`) lists a program's active attributes/uniforms.
- `debug-resources.ts` and `gl-debug.ts` are not re-exported by `ui/src/gl/index.ts`; import them by path.

## Extension points

- **New GL resource type:** give it an optional `gl` field holding `proxy`, add `compileX`,
  `updateX`, `disposeX` to `GLProxy`, and call compile/update lazily from the render path
  (`WebGLRenderer.renderModel` or `GLState.syncMaterial`).
- **New piece of cached state:** private field + getter on `GLState`, a `setX` that compares
  before calling GL, an `applyX`, and a line in `syncState()`.
- **New enum option:** add to the `GLSettings` enum and the matching `gl-decode.ts` switch.

## Gotchas

- Never call `gl.*` directly for state `GLState` tracks; the cache goes stale and later calls are
  skipped. `GLProxy.useIndexBuffer` itself binds `ELEMENT_ARRAY_BUFFER` without going through
  `GLState.bindElementArrayBuffer`.
- The `GLSettings.Material` enums and most `GLSettings.Texture` enums start at `-1` and skip `0`
  on purpose: their consumers use `||` (`blending.blendDst || this._blendDstFactor`, the `Texture`
  constructor), so a `0` value would be ignored. Keep new members of those enums non-zero.
  (`RenderTarget.*BufferFormat`, `Model.DrawMode` and `TextureBindingTarget` are 0-based and are
  not passed through `||`.)
- `CullSide` names the winding that gets culled: `CCW` sets `frontFace(CW)` + `cullFace(BACK)`.
  `Material` defaults to `CullSide.CCW`.
- `setBlending` re-applies only `blendFunc` when the equation changes; `blendEquation` is pushed
  only by `syncState()`. `BlendingDstFactor.DstColor` decodes to `gl.BLEND_DST_RGB`, not
  `gl.DST_COLOR`.
- `applyVertexAttributeArrays` `return`s at the first enabled location still in use, so later
  unused locations stay enabled and the will-use list is not reset in that case.
- `updateIndexBuffer` binds the buffer via `bindVBO` (ARRAY_BUFFER) before writing to
  `ELEMENT_ARRAY_BUFFER`; partial index updates rely on the correct element buffer already being
  bound (true inside the geometry's VAO).
- `drawElements*` always start at offset 0; `vertexDrawRange[0]` only applies to `drawArrays*`.
- `compileMaterial` mutates `material.uniforms` (removes unused names). A uniform whose location is
  not found is re-queried every frame (the miss is not cached).
- `inputImageFormat(HalfFloat)` returns `gl.FLOAT`, not `HALF_FLOAT`.
- `useUniformBuffer` and `compileUniformBuffer` are stubs; WebGL2 uniform buffer objects are not
  wired into rendering (see [GPU resources](gpu-resources.md)).
- `compileRenderTarget` marks a target `isInvalid` on an incomplete framebuffer and never retries;
  create a new `RenderTarget`.

## Related

- [WebGL renderer](renderer.md) — owner of `GLState`/`GLProxy` and the frame sequence.
- [GPU resources](gpu-resources.md) — the resource objects compiled here and their dirty flags.
- [Scene, model and material](scene-model-material.md) — `Material` fields `syncMaterial` reads.
