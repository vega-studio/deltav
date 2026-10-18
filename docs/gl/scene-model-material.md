---
title: Scene, model and material
summary: The low-level GL scene graph WebGLRenderer draws: Scene (ordered Model set), Model (Geometry + Material + draw range), Geometry (attributes, index buffer, VAO), Material (shaders, GL state, uniforms).
covers:
  - ui/src/gl/scene.ts
  - ui/src/gl/model.ts
  - ui/src/gl/material.ts
  - ui/src/gl/geometry.ts
  - ui/src/gl/types.ts
related:
  - gl/renderer.md
  - gl/gpu-resources.md
  - gl/state-and-proxy.md
  - surface/views-and-scenes.md
  - shaders/shader-processing.md
status: complete
verified-at: 5b9f617f
---

## Purpose

These four classes are what `WebGLRenderer.render` consumes. They are deliberately thin and
GL-flavoured: a layer's buffer manager builds a `Geometry`, `generateLayerMaterial` builds a
`Material`, `generateLayerModel` pairs them in a `Model`, and the model is added to the GL `Scene`
held in `LayerScene.container`. `ui/src/gl/types.ts` holds the shared GL types: uniform kinds, the
extension table, the context alias and `UseMaterialStatus`.

## Key files

- `ui/src/gl/scene.ts` — `Scene`: `models: Set<Model>`, `add`, `remove`.
- `ui/src/gl/model.ts` — `Model`: `id`, `geometry`, `material`, `drawMode`, `vertexDrawRange`, `drawInstances`, `vertexCount`.
- `ui/src/gl/geometry.ts` — `Geometry`: `addAttribute`, `removeAttribute`, `setIndexBuffer`, `resizeVertexCount`, `rebuild`, `destroy`, `isInstanced`, `maxInstancedCount`.
- `ui/src/gl/material.ts` — `Material`, `MaterialOptions`, `MaterialSettings`, `MaterialFragmentShader`.
- `ui/src/gl/types.ts` — `MaterialUniformType`, `MaterialUniformValue`, `IMaterialUniform`, `isUniform*` guards, `GLContext`, `CanvasElement`, `isOffscreenCanvas`, `IExtensions`, `UseMaterialStatus`.

## How it works

### Scene and Model

`Scene.models` is a `Set`, so draw order is insertion order; there is no sorting. `Model` fields
read by `GLProxy.draw`:

- `drawMode` — `GLSettings.Model.DrawMode` (default `TRIANGLES`).
- `vertexDrawRange` — `[start, end]`; both ≥ 0 draws `end - start` vertices from `start`
  (`drawArrays`), otherwise `[0, vertexCount]` is used. Default `[-1, -1]`.
- `drawInstances` — instance count; `-1` (default) disables instanced drawing.
- `vertexCount` — vertices per draw (per instance when instanced).

Buffer managers in `ui/src/surface/buffer-management` set these as instances are added/removed
(see [Buffer management overview](../buffers/overview.md)).

### Geometry

A name → `Attribute` map plus an optional `IndexBuffer`. `addAttribute(name, attribute)` also
sets `attribute.name` and recomputes `isInstanced`: **true only when the geometry mixes instanced
and non-instanced attributes** (per-vertex template + per-instance data), which is the condition
`GLProxy` uses for divisors and instanced draw calls. The attribute name must equal the shader's
`attribute`/`in` name; `GLProxy.useAttribute` looks the location up by that name.

`gl?: { vao?, proxy }` is created by `GLProxy.compileGeometry`, which builds a VAO when the
context or `OES_vertex_array_object` supports it and records all attribute pointers and the index
buffer into it. With a VAO, per-draw attribute setup is skipped; data uploads still happen via
`updateAttribute`.

- `resizeVertexCount(vertexCount, indexCount?)` resizes every attribute, disposes the VAO, and
  resizes the index buffer when `indexCount` is given.
- `rebuild()` disposes only the VAO (next draw rebuilds it); `destroy()` destroys attributes,
  index buffer and VAO.

### Material

A `Material` is shader sources plus the GL state to apply when drawing with it. Construct with
`new Material(options)` (`Object.assign` of `MaterialOptions`, then `gl` is deleted, so passing an
existing material copies its settings without its GL handles).

| Field | Default | Applied by |
|---|---|---|
| `vertexShader` | `""` | compiled by `GLProxy.compileMaterial` |
| `fragmentShader` | — | `MaterialFragmentShader`: `Map<RenderTarget \| null, {source, outputTypes, outputNames}>`, one program per entry |
| `blending` | src `SrcAlpha`, dst `OneMinusSrcAlpha`, `Add`; `null` disables | `GLState.setBlending` |
| `depthTest` / `depthWrite` / `depthFunc` | `true` / `true` / `LESS_OR_EQUAL` | `GLState` depth setters |
| `culling` | `CullSide.CCW` | `GLState.setCullFace` |
| `colorWrite` | `[true, true, true, true]` | `GLState.setColorMask` |
| `dithering` | `true` | `GLState.setDithering` |
| `uniforms` | `{}` | `GLState.syncMaterial` → `uploadUniform` |
| `uniformBuffers` | `{}` | stub (`GLState.useUniformBuffer`) |
| `polygonOffset` | — | not used (marked TODO) |
| `name` | `""` | logs; layers set it to the layer id |

`MaterialSettings` is `Material` minus shaders/name/gl; it is the shape of
`IViewProps.materialSettings`, which the renderer applies after each material to override state per
view.

Uniforms are `IMaterialUniform<T>`: `{ type: MaterialUniformType, data, gl? }`. `data` types
follow `MaterialUniformValue<T>` (`FLOAT` → `number`, `VEC2..4` → `Vec2..4`, `VEC4_ARRAY` →
`Vec4[]`, `FLOAT_ARRAY` → `number[] | Float32Array`, `MATRIX3x3`/`MATRIX4x4` → `Mat3x3`/`Mat4x4`,
`TEXTURE` → `Texture`). Uniform values are re-uploaded on every `syncMaterial`, so updating
`uniform.data` is enough; there is no dirty flag. `uniform.gl` caches the location per program.

`material.gl` (set by `compileMaterial`) holds `vsId`, `fsId[]`, `programId[]` with their
`outputTypes`, `programByTarget` and `outputsByProgram` (`WeakMap`s), and `proxy`.
`dispose()` releases programs/shaders through `GLProxy.disposeMaterial` (reference counted).

### UseMaterialStatus

`GLState.useMaterial` returns `VALID`, `INVALID` (the renderer removes the model from the scene)
or `NO_RENDER_TARGET_MATCHES` (draw skipped, model kept) — see
[WebGL renderer](renderer.md).

### IExtensions and GLContext

`GLContext = WebGLRenderingContext | WebGL2RenderingContext`. `IExtensions` fields
(`instancing`, `drawBuffers`, `vao`, `floatTex`, `halfFloatTex`, their linear-filter variants) hold
either the WebGL2 context itself or the WebGL1 extension object; `anisotropicFiltering` carries the
extension plus `stat.maxAnistropicFilter`. `CanvasElement` / `isOffscreenCanvas` let the surface
accept an `OffscreenCanvas`.

## Extension points

- **Custom draw outside layers:** create `Attribute`s, a `Geometry`, a `Material` with
  `vertexShader` and a `fragmentShader` map (`new Map([[null, { source, outputTypes:
  [FragmentOutputType.COLOR], outputNames: [...] }]])`), a `Model`, set `vertexCount`, add to a
  `Scene` and render. See `AtlasManager` in `ui/src/resources/texture/atlas-manager.ts`.
- **Per-layer material options:** `Layer.getMaterialOptions()` and `ILayerProps.materialOptions`
  feed `generateLayerMaterial` (`ui/src/surface/layer-processing/generate-layer-material.ts`).
- **New uniform kind:** add a `MaterialUniformType` member, its `MaterialUniformValue` mapping,
  an `isUniform*` guard if useful, and a case in `GLState.uploadUniform`.

## Gotchas

- `Geometry.isInstanced` is false when *all* attributes are instanced; such a geometry draws
  non-instanced even with `drawInstances >= 0`.
- `Geometry.attributes` is a cached `Map` rebuilt after add/remove; do not mutate it directly.
- Adding or removing an attribute after the VAO exists does not rebuild it; call
  `geometry.rebuild()`.
- `compileMaterial` deletes entries from `material.uniforms` that no linked program uses, and
  marks the material invalid (model removed) when the program needs a uniform the material lacks.
- `Material.clone()` copies the `uniforms` dictionary shallowly: the uniform objects (and their
  `data`) are shared with the source. It also turns `blending: null` into `{}` (blending
  enabled, previous factors kept) and `polygonOffset: undefined` into `{}`.
- `Material.gl` and `uniform.gl` are framework-owned; editing them desyncs the program cache.

## Related

- [WebGL renderer](renderer.md) — how scenes are drawn.
- [GPU resources](gpu-resources.md) — `Attribute`, `IndexBuffer`, `Texture`, `RenderTarget`.
- [GL state and proxy](state-and-proxy.md) — compilation, program selection, uniform upload.
- [Views and scenes](../surface/views-and-scenes.md) — `LayerScene` / `View`, which own these scenes and render targets.
- [Shader processing](../shaders/shader-processing.md) — produces the shader sources a `Material` compiles.
