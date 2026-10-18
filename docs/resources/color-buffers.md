---
title: Color buffers
summary: Color buffer resources: keyed WebGL renderbuffers a view renders into (color, depth, MSAA, picking outputs), how they are sized, resized and resolved into textures by blitting.
covers:
  - ui/src/resources/color-buffer
related:
  - resources/resource-management.md
  - resources/textures-and-atlases.md
  - react/post-processing.md
  - interaction/picking.md
  - surface/views-and-scenes.md
  - gl/gpu-resources.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

A color buffer resource (`ResourceType.COLOR_BUFFER`) is a keyed, surface-owned wrapper around a GL
`ColorBuffer` — a WebGL renderbuffer. Renderbuffers cannot be sampled in shaders, so this resource is
**output only**: a view writes color, depth or picking data into it, typically to get multisampled
(MSAA) rendering that is then blitted into a render texture. It shares the screen-relative sizing
scheme of render textures.

## Key files

- `ui/src/resources/color-buffer/color-buffer-resource.ts` — `IColorBufferResource`, `createColorBuffer`, `isColorBufferResource`, `ColorBufferResource` (builds the `ColorBuffer`).
- `ui/src/resources/color-buffer/color-buffer-resource-request.ts` — `IColorBufferResourceRequest`, `colorBufferRequest`.
- `ui/src/resources/color-buffer/color-buffer-resource-manager.ts` — `ColorBufferResourceManager`.
- `ui/src/gl/color-buffer.ts` — the GL `ColorBuffer` class and `ColorBufferOptions` (`internalFormat`, `size`, `multiSample`).
- `ui/src/surface/view.ts` — the consumer: `View.createRenderTarget`, `ViewOutputBuffers`, `ViewDepthBuffer`, `BlitOutputBuffers`.

## How it works

### Declaring

```ts
createColorBuffer({
  key: "msaa-color",
  width: TextureSize.SCREEN,
  height: TextureSize.SCREEN,
  colorBufferSettings: { multiSample: 4 },
});
```

The options go in `IPipeline.resources`. `ColorBufferResourceManager.initResource` constructs
`new ColorBufferResource(options, this.webGLRenderer)`, which creates
`new ColorBuffer({ internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA8, size, ...colorBufferSettings })`.
`colorBufferSettings` is `ColorBufferOptions`, so it can override `internalFormat` (including a
depth or stencil format for a depth target) and set `multiSample` (clamped to
`WebGLStat.MSAA_MAX_SAMPLES` by the `ColorBuffer` setter).

### Sizing

`width`/`height` are pixels or a negative `TextureSize.SCREEN*` value. A screen value divides
`renderer.getRenderSize()` by the fraction (`SCREEN_HALF = -2` → half). Screen sizing throws if the
manager has no `WebGLRenderer` yet. `ColorBufferResourceManager.resize()` (called from
`Surface.resize` via the router) destroys and rebuilds every resource with a screen-tied dimension.
`View` notices its render target references a destroyed buffer and calls `createRenderTarget()` again,
which re-requests the new buffer.

### Consumption by views

There is no shader-side use and `getIOExpansion()` returns `[]`. Views request the buffer
synchronously with a dummy layer and instance:

- `view.props.output.buffers` maps `FragmentOutputType` (or a custom number) to an
  `IRenderTextureResource | IColorBufferResource`; a single resource means `COLOR`.
- `View.requestBufferResources` sends `colorBufferRequest({ key })`; the manager sets
  `request.colorBuffer` and returns `[0, 0, 1, 1]` (or `[0, 0, 0, 0]` and no buffer when the key is
  unknown, which makes the view throw `Output target unable to be constructed`).
- `output.depth` may be a color buffer resource (with a depth `internalFormat`), a render texture,
  or `true` for a system `DEPTH_COMPONENT16` buffer.
- `output.blit.color` / `output.blit.depth` name the targets the view's framebuffer is blitted to
  after rendering — the way to turn a multisampled color buffer into a samplable render texture for a
  later post-processing view.
- Picking: a buffer bound to `FragmentOutputType.PICKING` is read back by `SurfaceCommands`; a color
  buffer or a render texture without mipmaps both work.

`updateResource` only warns (`UPDATING AN EXISTING COLOR BUFFER IS NOT SUPPORTED YET`).
`destroyResource` destroys the `ColorBuffer` and forgets the key; `destroy` clears all.

## Extension points

- Use `colorBufferSettings` (`ColorBufferOptions`) for format and MSAA; there is no other hook.
- In JSX, `ColorBufferJSX` and `DepthBufferJSX` declare these resources (their `config` prop maps
  to `colorBufferSettings`) — see [React surface](../react/react-surface.md) and
  [Post processing](../react/post-processing.md).
- A replacement manager can be registered for `ResourceType.COLOR_BUFFER` through
  `ISurfaceOptions.resourceManagers`; it must set `request.colorBuffer` synchronously in `request`.

## Gotchas

- Cannot be sampled: binding a color buffer key to an attribute `resource` does nothing (no IO
  expansion). Blit to a render texture to read it in a shader.
- All buffers of one view's output must have identical dimensions, and none may be zero; `View`
  throws otherwise. Mix screen-sized and fixed-size targets with care.
- A screen-sized height is computed as `renderSize[1] / -width` (the **width** field is the divisor),
  so a fixed `width` with a screen-relative `height` produces a negative height. Use the same screen
  fraction for both.
- To change size or settings, remove the resource from the pipeline and add it under a new key;
  `updateResource` is a no-op.
- `ui/src/resources/index.ts` imports `createColorBuffer`/`colorBufferRequest` into `RESOURCE` and
  `REQUEST` but does **not** `export *` the color-buffer module, so `ColorBufferResourceManager`,
  `isColorBufferResource` and `IColorBufferResource` are not exported from the package root; import
  them from `ui/src/resources/color-buffer` inside the repo, or use `RESOURCE.createColorBuffer`.
- Render textures default to `generateMipMaps: true`; a render texture used as a picking target
  triggers a picking-accuracy warning — a color buffer avoids that.

## Related

- [Resource management](resource-management.md) — router, registration and lifecycle.
- [Textures and atlases](textures-and-atlases.md) — render textures, the samplable counterpart.
- [Views and scenes](../surface/views-and-scenes.md) — view output configuration and render targets.
- [Post processing](../react/post-processing.md) — multi-view pipelines built on these targets.
- [Picking](../interaction/picking.md) — the PICKING output read back from these buffers.
- [GPU resources](../gl/gpu-resources.md) — `ColorBuffer`, `RenderTarget`, `Texture`.
