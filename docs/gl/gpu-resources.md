---
title: GPU resources
summary: Attribute, IndexBuffer, UniformBuffer, Texture, RenderTarget and ColorBuffer: CPU-side wrappers of GL objects, their dirty flags, resize/repeat helpers and disposal.
covers:
  - ui/src/gl/attribute.ts
  - ui/src/gl/index-buffer.ts
  - ui/src/gl/uniform-buffer.ts
  - ui/src/gl/texture.ts
  - ui/src/gl/render-target.ts
  - ui/src/gl/color-buffer.ts
related:
  - gl/state-and-proxy.md
  - gl/scene-model-material.md
  - resources/textures-and-atlases.md
  - resources/color-buffers.md
status: complete
verified-at: 4098986b
---

## Purpose

These classes hold the CPU-side description and data of every GPU object DeltaV uses. They never
call WebGL themselves: they set dirty flags, and `GLProxy` (see
[GL state and proxy](state-and-proxy.md)) compiles and uploads them the next time they are used in
a draw. Each holds an optional `gl` field with the GL handles plus the owning `proxy`; `destroy()` /
`dispose()` route through that proxy.

## Key files

- `ui/src/gl/attribute.ts` — `Attribute`: a `Float32Array` vertex buffer bound to a shader attribute by name.
- `ui/src/gl/index-buffer.ts` — `IndexBuffer`: `Uint8Array | Uint16Array | Uint32Array` element indices.
- `ui/src/gl/uniform-buffer.ts` — `UniformBuffer`: std140 packing of a uniform block (not wired to the GPU yet).
- `ui/src/gl/texture.ts` — `Texture`, `TextureOptions`, `Texture.emptyTexture`.
- `ui/src/gl/render-target.ts` — `RenderTarget`, `IRenderTargetOptions`, `RenderBufferOutputTarget`.
- `ui/src/gl/color-buffer.ts` — `ColorBuffer`, `ColorBufferOptions`: a renderbuffer (not sampleable) attachment.

## How it works

### Attribute

`new Attribute(data, size, isDynamic = false, isInstanced = false)`. `size` is floats per vertex
(or per instance); sizes > 4 occupy several consecutive shader locations. `count` is
`data.length / size`. `normalize` is passed to `vertexAttribPointer`.

Dirty model:

- Write into `attribute.data`, then assign `attribute.updateRange = { offset, count }` (the setter
  sets `needsUpdate`). `offset`/`count` are **element indices into the Float32Array**, not
  vertices; `GLProxy.updateAttribute` uploads `data.subarray(offset, offset + count)` at byte
  `offset * 4`. A negative `offset` or `count` means a full re-upload.
- `resize(count, retainData?)` allocates `count * size` floats, copies the old data (all of it, or
  the first `retainData` elements), calls `destroy()` (frees the GL buffer) and sets
  `needsUpdate` + `fullUpdate`.
- `setDynamic(b)` toggles the usage hint and forces a full upload.
- `resolve()` (called by the proxy after upload) clears `needsUpdate` and `fullUpdate`.
- `repeatInstances(instanceCount, instanceVertexCount, startInstance = 1)` copies instance 0 (the
  template, the first `instanceVertexCount * size` floats) into following instance slots using
  doubling `copyWithin` batches; it throws when `startInstance < 1`, silently stops at the end of
  the buffer, and does not flag an update. Behaviour is pinned by `unit-test/gl/attribute.test.ts`.

### IndexBuffer

`new IndexBuffer(data, isDynamic = false, isInstanced = false)`; same `updateRange` /
`resolve` / `setDynamic` / `destroy` / `rebuild` model as `Attribute` (byte offset uses the
array's `BYTES_PER_ELEMENT`). `resize(count, vertexCount)` picks the smallest type that can address
`vertexCount` vertices (`> 65535` → `Uint32Array`, `> 256` → `Uint16Array`, else `Uint8Array`),
casting old values if the type changed. `repeatInstances(instanceCount, instanceVertexCount,
indexVertexCount, startInstance = 1)` repeats the first `indexVertexCount` indices with each
copy offset by `instanceVertexCount`, upcasting the array type first when needed. Its `gl.indexType`
(`UNSIGNED_BYTE/SHORT/INT`) is derived from the array class at compile time.

### Texture

All configuration is through setters that flip one of three flags:

| Flag | Set by | Effect in `GLProxy.updateTexture` |
|---|---|---|
| `needsDataUpload` | `data`, `format`, `internalFormat`, `type`, `flipY` | full `texImage2D` (+ `generateMipmap` if `generateMipMaps`) |
| `needsSettingsUpdate` | `minFilter`, `magFilter`, `wrapHorizontal/Vertical`, `anisotropy`, `premultiplyAlpha`, `generateMipMaps`, alignments | `texParameteri` / `pixelStorei` / anisotropy |
| `needsPartialDataUpload` | `update(data, region)` (queued in `updateRegions`) | `texSubImage2D` per region |

`data` is an image source (`ImageBitmap`, `ImageData`, image/canvas/video element,
`OffscreenCanvas`) or `{ width, height, buffer }` where `buffer: null` allocates an empty texture
(render-target textures). `applySettings(options)` assigns only changed fields. Defaults: RGBA /
UNSIGNED_BYTE, `minFilter` `LinearMipMapLinear`, `magFilter` `Linear`, `CLAMP_TO_EDGE`, no mipmaps.
`isFloatTexture` / `isHalfFloatTexture` derive from `internalFormat` and `type`.

A texture can only be compiled once it holds a texture unit (`gl.textureUnit >= 0`); `GLState`
assigns units when a uniform or render target uses it. `destroy()` disposes the GL texture, frees
its unit, deletes `data` and marks it `destroyed`. `Texture.emptyTexture` is a shared 2×2
transparent texture for "no texture" uniforms.

### RenderTarget

`new RenderTarget({ buffers: { color, depth, stencil, blit }, width?, height?,
retainTextureTargets? })`:

- `color`: one `{ buffer: Texture | ColorBuffer, outputType }` or an array of them (MRT).
  `outputType` is a `FragmentOutputType` from `ui/src/types.ts`; it is how `GLState.useMaterial`
  matches material fragment outputs to attachments.
- `depth`: a `GLSettings.RenderTarget.DepthBufferFormat` (renderbuffer created for you), a
  `Texture` or a `ColorBuffer`. `stencil`: a `StencilBufferFormat` or `Texture`.
- `blit`: textures/buffers the FBO is copied into after rendering (WebGL2 `blitFramebuffer`);
  used to resolve multisampled color buffers into sampleable textures.
- Size comes from the first texture's `data` or `ColorBuffer.size`; `width`/`height` are used only
  when no texture/buffer dictates it. `calculateDimensions` removes (with a warning) any buffer
  whose size differs, any Texture without `data`, and any Texture mixed with a multisampled
  `ColorBuffer`.

Runtime helpers: `getBuffers()` (color buffers as a list), `getGLBuffers()` (compiled attachments),
`getOutputTypes()`, `getTextures()` (color, depth, stencil and blit textures), `isColorTarget()`,
`disabledTargets` (output types to route to `gl.NONE`), `validFramebuffer` (set by
`setAsValid()` after a complete framebuffer check), `isInvalid` (set on failure; never retried).
`setSize(w, h)` disposes the FBO and resets every texture's `data` to `{ width, height,
buffer: null }`. `dispose()` deletes the FBO(s) and renderbuffers, and the textures only when
`retainTextureTargets` is false.

### ColorBuffer

`new ColorBuffer({ size, internalFormat, multiSample })`: a renderbuffer attachment. Default
`internalFormat` is `ColorBufferFormat.RGBA8`; `multiSample` is clamped to
`WebGLStat.MSAA_MAX_SAMPLES` (0 on WebGL1). Compiled by `GLProxy.compileColorBuffer` /
`compileDepthBuffer` into `gl.bufferId`. `destroy()` deletes it and marks it `destroyed`.

### UniformBuffer

`new UniformBuffer(name, blockStructure, dynamic?)` computes std140 offsets/padding for members
listed from smallest to largest (`UniformSize` ONE, TWO, THREE, FOUR, MATRIX3, MATRIX4, then arrays)
into `data: Float32Array`; `update()` writes members whose `update` flag is set. Nothing creates a
GL buffer for it (`GLProxy.compileUniformBuffer` and `GLState.useUniformBuffer` are stubs) and no
code outside `ui/src/gl` constructs one. Not to be confused with `UniformBufferManager`
(uniform-array instancing) in `ui/src/surface/buffer-management/uniform-buffering`.

## Extension points

- New buffer subclass or format: add `GLSettings` enum values and decoder cases (see
  [GL state and proxy](state-and-proxy.md)); keep the "setter flips a dirty flag, proxy consumes
  it, `resolve()` clears it" contract.
- Partial uploads: mutate `data` in place and set `updateRange`; for textures call `update`.
- Offscreen passes: build a `RenderTarget` with `Texture` color buffers and pass it to
  `WebGLRenderer.render`; for MSAA use multisampled `ColorBuffer`s plus `blit` textures.

## Gotchas

- `Attribute.updateRange` is in float elements; passing a vertex index uploads the wrong bytes.
  Also note the getter returns the live object (not a copy, despite the comment); mutating it does
  not set `needsUpdate` — reassign it.
- `Attribute.resize` / `IndexBuffer.resize` call `destroy()`, which deletes the GL buffer;
  `Geometry.resizeVertexCount` additionally disposes the VAO so it is rebuilt.
- After upload `GLProxy.updateTextureData` replaces `texture.data` with
  `{ width, height, buffer: null }`: the CPU copy is dropped. Keep your own reference if you need
  the pixels again.
- `Texture` constructor reads options with `||` and sets `internalFormat` to `format` when not
  given; falsy option values are ignored.
- `packAlignment` / `unpackAlignment` only flag a settings update; no code applies them with
  `pixelStorei`.
- Float textures always get `NEAREST` min filtering and no wrap settings in
  `updateTextureSettings`; on WebGL1 non-power-of-two textures are forced to `LINEAR` filters.
- `RenderTarget.retainTextureTargets` defaults to **true**: disposing a target keeps its textures
  alive. Destroy them yourself.
- `ColorBuffer` setters set `needsSettingsUpdate`, but nothing reads it: changing `size`,
  `internalFormat` or `multiSample` after compile has no effect. `ColorBuffer.size` is used only
  for target dimension checks; storage uses the render target's width/height.
- `disposeRenderTarget` deletes renderbuffers but leaves `ColorBuffer.gl.bufferId` set, and
  `compileRenderTarget` reuses `ColorBuffer.gl.bufferId` when present. Do not reuse a
  `ColorBuffer` across a target `setSize`/`dispose`; create a new one.
- `ColorBufferFormat.RGBA8` (the default) is WebGL2-only; on WebGL1 `colorBufferFormat` falls
  back to `RGBA4`.
- `UniformBuffer` ordering validation: the loop clears every size from the allowed set after the
  first member (the `allSizes.slice` result is discarded), so a block with two or more members
  throws. Unused today, but fix before wiring UBOs.
- `RenderTarget` is meant to be immutable: "DO NOT EDIT existing render targets"; dispose and
  recreate instead.

## Related

- [GL state and proxy](state-and-proxy.md) — compile/update/dispose of every class here.
- [Scene, model and material](scene-model-material.md) — `Geometry` groups attributes and the index buffer.
- [Textures and atlases](../resources/textures-and-atlases.md) — higher-level texture management.
- [Color buffers](../resources/color-buffers.md) — the resource-manager wrapper around `ColorBuffer`.
