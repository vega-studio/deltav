---
title: Textures and atlases
summary: Atlas and render texture resources: packing images and videos into an atlas, SubTexture coordinates, render textures, and how TextureIOExpansion exposes them to shaders as sampler2D uniforms.
covers:
  - ui/src/resources/texture
related:
  - resources/resource-management.md
  - resources/color-buffers.md
  - gl/gpu-resources.md
  - 2d/layers.md
  - shaders/io-expansion.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

Two resource types live here. An **atlas** (`ResourceType.ATLAS`) is one GPU texture into which many
images, canvases or videos are packed on demand, so thousands of instances showing different images
draw in one call; each image becomes a `SubTexture` holding its UV rectangle. A **render texture**
(`ResourceType.TEXTURE`) is a plain `Texture` a view can render into and a layer can sample. Both
reach shaders through `TextureIOExpansion`, which also serves the font manager.

## Key files

- `ui/src/resources/texture/atlas.ts` — `IAtlasResource`, `createAtlas`, `isAtlasResource`, `Atlas` (texture, `packing`, `resourceReferences` ref counts).
- `ui/src/resources/texture/atlas-resource-request.ts` — `IAtlasResourceRequest`, `atlasRequest`, `AtlasResource` (accepted source types).
- `ui/src/resources/texture/atlas-resource-manager.ts` — `AtlasResourceManager` (request queue, instance (de)activation), `IAtlasResourceManagerOptions`.
- `ui/src/resources/texture/atlas-manager.ts` — `AtlasManager`: `createAtlas`, `updateAtlas`, image loading, packing, GPU repacking.
- `ui/src/resources/texture/pack-node.ts` — `PackNode<T>` binary-tree rectangle packer, `PackNode.applyToSubTexture`.
- `ui/src/resources/texture/sub-texture.ts` — `SubTexture`, `subTextureIOValue`, `SubTexture.fromRegion`.
- `ui/src/resources/texture/image-rasterizer.ts` — `ImageRasterizer` (2D-canvas warm-up and `resizeImage` for `rasterizationScale`).
- `ui/src/resources/texture/video-texture-monitor.ts` — `VideoTextureMonitor`: per-frame re-upload of a video's region.
- `ui/src/resources/texture/texture-io-expansion.ts` — `TextureIOExpansion`: sampler2D + `_size` uniforms for resource attributes.
- `ui/src/resources/texture/render-texture.ts` — `IRenderTextureResource`, `createTexture`, `isRenderTextureResource`, `RenderTexture`.
- `ui/src/resources/texture/render-texture-resource-request.ts` — `IRenderTextureResourceRequest`, `textureRequest`.
- `ui/src/resources/texture/render-texture-resource-manager.ts` — `RenderTextureResourceManager`.

## How it works

### Atlas creation

`createAtlas({ key, width, height, textureSettings? })` in `IPipeline.resources` →
`AtlasResourceManager.initResource` → `AtlasManager.createAtlas` → `new Atlas(options)`. The atlas
makes a blank canvas of `width × height` as the initial `Texture` data, defaults the texture settings
to `generateMipMaps: true, premultiplyAlpha: true` (overridable via `textureSettings`) and a root
`PackNode(0, 0, width, height)`. Sizes must be `TextureSize` powers of two; negative (screen) sizes
throw.

### Requesting an image

An attribute's `update` returns `this.resource.request(layer, instance, atlasRequest({ key, source }))`.
`AtlasResourceManager.request`:

1. If `request.texture` (a `SubTexture`) is set → return `subTextureIOValue(texture)` =
   `[TL.x, TL.y, BR.x, BR.y]` in atlas UV space.
2. Else, if the same request object is already queued → add `[layer, instance]` to its waiters,
   set `instance.active = false`, return zeros.
3. Else → queue the request under its atlas key, deactivate the instance (unless
   `disposeResource`), return zeros.

`dequeueRequests` (called by the surface after drawing) awaits
`AtlasManager.updateAtlas(key, requests)`, then re-activates waiting instances still managed by
their layer and calls `instance.resourceTrigger()` on the next frame.

### Packing and upload (`AtlasManager.draw`)

- If `atlas.resourceReferences` already holds `request.source`, the existing `SubTexture` is reused
  — the cache key is the **source value** (URL string or element identity).
- Otherwise a new `SubTexture` is registered, then `loadImage` resolves the source: an
  `HTMLImageElement` waits for `onload` if it has no size; a string is loaded as an image URL with
  `crossOrigin = "anonymous"`; an `HTMLVideoElement` must already have `videoWidth/videoHeight`;
  `ImageBitmap`/`ImageData`/canvases are used as-is. `rasterizationScale ≠ 1` resizes through
  `ImageRasterizer.resizeImage` (a PNG data-URL round trip).
- `atlas.packing.insert` places the image rectangle. On failure `repackResources` runs once and the
  insert is retried; if it still fails the sub texture gets zero coordinates.
- `PackNode.applyToSubTexture` writes `atlasTL/TR/BL/BR` (UVs; pack-space Y is flipped,
  and the upload region `atlasRegion.y` is flipped to match), inset by half a texel on each side, plus `pixelWidth/Height` and `widthOnAtlas/heightOnAtlas`.
- `atlas.texture.update(image, atlasRegion)` uploads the region. Videos get a `VideoTextureMonitor`
  that calls `SubTexture.update()` every frame when `video.currentTime` moved.

### Reference counting and freeing

After drawing, `updateAtlas` calls `Atlas.useResource` for normal requests and
`Atlas.stopUsingResource` for requests with `disposeResource: true`, then `Atlas.resolveResources`,
which invalidates (zeroes, `isValid = false`, `texture = null`, stops video) every sub texture whose
count is ≤ 0 and drops it from `resourceReferences`. Space is not reclaimed in place:
`PackNode.remove` is not called; dead regions are reclaimed only by `repackResources`.

### Repacking on the GPU

`AtlasManager.repackResources` (needs `this.renderer`, set through the manager's `webGLRenderer`
setter) collects pack nodes whose `SubTexture.texture` is still set, sorts them largest first,
re-inserts them into a fresh `PackNode`, and renders quads from the old texture into a new
`Texture` via a `RenderTarget` + `Model`. The same `SubTexture` objects are updated in place, so
holders see new coordinates, but **instances must re-run their attribute update** to push new UVs to
the GPU. The old texture is destroyed.

### Render textures

`createTexture({ key, width, height, textureSettings? })` → `RenderTextureResourceManager.initResource`
→ `new RenderTexture(options, renderer)`, a `Texture` with defaults `generateMipMaps: true,
premultiplyAlpha: false` and `data: { width, height, buffer: null }` unless `textureSettings.data` is
given. Negative `TextureSize.SCREEN*` values size from `renderer.getRenderSize()` divided by the
fraction; `resize()` rebuilds screen-sized textures. `request` with `textureRequest({ key })` is
synchronous: it sets `request.texture` and returns `[0, 0, 1, 1]`. `updateResource` rebuilds on a size
change, else calls `texture.applySettings(textureSettings)`. Views use render textures as output and
depth targets ([Color buffers](color-buffers.md) covers that path).

### Shader exposure (`TextureIOExpansion`)

`AtlasResourceManager`, `RenderTextureResourceManager` and `FontResourceManager` each return
`new TextureIOExpansion(type, this)`. For every instance attribute with `resource` whose
`key()` maps (through `ResourceRouter.getResourceType`) to that type, it:

- defaults the attribute `size` to `InstanceAttributeSize.FOUR`;
- adds one `UniformSize.TEXTURE` uniform per unique `resource.name`, whose `update` returns
  `manager.getResource(key).texture` or `Texture.emptyTexture`;
- adds `<name>_size` (vec2: texture `data.width/height`, default `[1, 1]`);
- merges `shaderInjection` targets of attributes sharing a name (default FRAGMENT) and declares
  `uniform sampler2D <name>;` in `processHeaderInjection`;
- `validate` rejects an attribute with both `easing` and `resource`.

## Extension points

- Custom atlas behaviour: `new AtlasResourceManager({ atlasManager })` with your own `AtlasManager`
  subclass, registered for `ResourceType.ATLAS` in `ISurfaceOptions.resourceManagers`.
- A new texture-like resource type can reuse `TextureIOExpansion(type, manager)`: the manager only
  needs `router` and `getResource(key)` returning `{ type, texture? }`.
- `SubTexture.fromRegion(texture, bounds)` builds a sub texture over an arbitrary region of an
  existing `Texture` without an atlas.
- Image-layer style resource sharing: keep one request object per source (see
  `ImageLayer.sourceToRequest` in `ui/src/2d/layers/images/image-layer.ts`) and send
  `atlasRequest({ key, source, disposeResource: true })` when an instance drops a source.

## Gotchas

- Reuse request objects. Pending de-duplication is by request **object** identity, and the resolved
  `SubTexture` is cached on `request.texture`; a fresh request per update re-enters the queue each time.
- `Atlas.useResource` / `stopUsingResource` read the reference with a fallback object but never store
  a new one, and `draw` registers new sources with `count: 0` — counts only change for sources already
  in `resourceReferences`. Do not rely on precise ref counting; disposal through
  `disposeResource` decrements an existing entry.
- `AtlasResourceManager.updateResource` does nothing: changing an atlas' size or settings needs a
  new key (or remove + re-add).
- No gutter pixels between packed images (only the half-texel UV inset) and mipmaps are on by
  default, so minified sampling can bleed neighbouring images; set `textureSettings` if that matters.
- A video must be loaded (`videoWidth > 0`) before it is requested; the manager does not wait for it.
  `VideoTextureMonitor.destroy` pauses the video.
- String sources are fetched with `crossOrigin = "anonymous"`; servers must send CORS headers or the
  upload taints/fails.
- `RenderTexture` with a screen-sized height computes `height = renderSize[1] / -width` (it divides by
  the **width** field), so a fixed width with a screen-sized height yields a negative height; use the
  same screen fraction for both dimensions.
- `Atlas` construction uses `document.createElement("canvas")`: atlases cannot be built outside a DOM.

## Related

- [Resource management](resource-management.md) — router, lifecycle and the request/dequeue cycle.
- [Color buffers](color-buffers.md) — renderbuffer targets; render textures as view outputs.
- [GPU resources](../gl/gpu-resources.md) — the `Texture` class these resources wrap.
- [2D layers](../2d/layers.md) — `ImageLayer`, the main atlas consumer.
- [IO expansion](../shaders/io-expansion.md) — where `TextureIOExpansion` plugs in.
