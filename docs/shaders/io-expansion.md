---
title: IO expansion
summary: The layer-processing stage: BaseIOExpansion expanders (basic, active, easing), the WebGL1/2 compatibility transform, and generation of layer geometry, material, model and the default scene.
covers:
  - ui/src/surface/layer-processing
related:
  - shaders/shader-processing.md
  - instances/easing-and-animation.md
  - buffers/overview.md
  - resources/textures-and-atlases.md
  - gl/scene-model-material.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

IO expansion is the plug-in layer of shader processing. Each `BaseIOExpansion` can add Shader IO
derived from what a layer declared (easing adds start/time/duration attributes, resources add
sampler uniforms), and writes the GLSL that declares and destructures that IO. The same folder
holds the default shader transform that reconciles GLSL ES 1.0 and 3.0, and the generators that
turn processed IO into GL `Geometry`, `Material` and `Model` objects.

## Key files

- `ui/src/surface/layer-processing/base-io-expansion.ts` — `BaseIOExpansion` (`validate`, `expand`, `processHeaderInjection`, `processAttributeDestructuring`), `ShaderIOExpansion`.
- `ui/src/surface/layer-processing/base-io-expanders/basic-io-expansion.ts` — `BasicIOExpansion`: declares every attribute/uniform, block destructuring, picking varying assignment.
- `ui/src/surface/layer-processing/base-io-expanders/active-io-expansion.ts` — `ActiveIOExpansion`: early-exit for inactive instances.
- `ui/src/surface/layer-processing/base-io-expanders/fragments/active-attribute-handler.vs` — the injected `_active` check.
- `ui/src/surface/layer-processing/base-io-expanders/easing-io-expansion.ts` — `EasingIOExpansion`, `createEasingAttribute`.
- `ui/src/surface/layer-processing/base-shader-transforms/shaders-30-compatibility-transform.ts` — `Shaders30CompatibilityTransform`.
- `ui/src/surface/layer-processing/generate-layer-geometry.ts` — `generateLayerGeometry`.
- `ui/src/surface/layer-processing/generate-layer-material.ts` — `generateLayerMaterial`.
- `ui/src/surface/layer-processing/generate-layer-model.ts` — `generateLayerModel`.
- `ui/src/surface/layer-processing/generate-default-scene.ts` — `generateDefaultScene`, `IDefaultElements`.
- `ui/src/surface/surface.ts` — `DEFAULT_IO_EXPANSION`, `DEFAULT_SHADER_TRANSFORM`, `ISurfaceOptions.ioExpansion`/`shaderTransforms` (wiring only).
- `ui/src/resources/texture/texture-io-expansion.ts` — `TextureIOExpansion`, the resource-side expander (documented with resources).

## How it works

### The expander contract

`BaseIOExpansion extends BaseShaderIOInjection`. All four methods have no-op defaults:

| Method | Called from | Job |
|---|---|---|
| `validate(layer, instanceAttrs, vertexAttrs, uniforms)` | `injectShaderIO` | Return `false` (after logging) to skip `expand` for this layer |
| `expand(...)` | `injectShaderIO` | Return `{ instanceAttributes, vertexAttributes, uniforms, indexBuffer? }` to append |
| `processHeaderInjection(target, declarations, layer, metrics, vertexAttrs, instanceAttrs, uniforms)` | `ShaderProcessor.process`, once for VERTEX and once per view for FRAGMENT | Write declarations; return `{ injection, material? }` |
| `processAttributeDestructuring(layer, declarations, metrics, vertexAttrs, instanceAttrs, uniforms)` | `ShaderProcessor.process`, VS only | Write statements placed at `${attributes}` / start of `main()` |

Declarations go through `this.setDeclaration(map, key, value, debugCtx)`: one entry per key, later
writers override earlier ones. Map insertion order is emission order, so the expander order matters.

The surface's list is `DEFAULT_IO_EXPANSION()` = `[BasicIOExpansion, ActiveIOExpansion,
EasingIOExpansion]` (or what `ISurfaceOptions.ioExpansion` returns), followed by every resource
manager's `getIOExpansion()` (e.g. `TextureIOExpansion` for atlas, font, render-texture and
colour-buffer resources).

### BasicIOExpansion

- **VS header**: vertex attributes as `attribute`/`in <type> <name>;` (`in` when `WebGLStat.SHADERS_3_0`). Instance attributes are declared by name for `INSTANCE_ATTRIBUTE`/`VERTEX_ATTRIBUTE` buffering, or as `block0 … blockN` `vec4`s for the `_PACKING` strategies (N = `metrics.instanceMaxBlock`). Optional `qualifier` is written before the name.
- **Uniform header** (VS and FS): each uniform whose `shaderInjection` (defaulted to `VERTEX` and written back onto the uniform) matches the target or is `ALL` becomes `uniform [qualifier] <type> <name>;`. `UniformSize.FLOAT_ARRAY`/`VEC4_ARRAY` also emit `#define <name>_length N` from the current value length and declare `<name>[<name>_length]`. `UniformSize.TEXTURE` is written here as `vec4`; `TextureIOExpansion` (later in the list) overrides the same declaration key with `uniform sampler2D <name>;`, so texture uniforms need a resource manager's expander present.
- **Destructuring**: for packing strategies each attribute becomes a local, e.g. `vec2 center = block0.xy;`, `vec4 color = block1;`, `mat4 m = mat4(block2, block3, block4, block5);`. Non-packed strategies need none. When `layer.picking.type === PickType.SINGLE` it appends `_picking_color_pass_ = _pickingColor;`.
- The uniform-buffer (`LayerBufferType.UNIFORM`) declaration and destructuring paths are commented out ("out of service").

### ActiveIOExpansion

If an instance attribute named `_active` (`activeAttributeName`, added by the `instancing` module)
exists, registers the destructuring entry `__active_attribute_handler__`: when `_active < 0.5`
it sets `gl_Position = vec4(0,0,0,1)` and `return`s from `main`. Destructuring registered by
expanders after it (easing) runs only for active instances.

### EasingIOExpansion

For every instance attribute with `easing` (an `IAutoEasingMethod`) and `size <= 4`:

- `expand` renames the attribute to `_<name>_end`, records `layer.easingId[_<name>_end] = easing.uid`, and replaces its `update` with a wrapper that computes the current eased value on the CPU (`easing.cpu`), stores per-instance `EasingProps` in `instance.easing` (keyed by uid), honours `delay`, `duration` and `loop` (`AutoEasingLoopStyle.NONE`, `CONTINUOUS`, `REPEAT`, `REFLECT`), extends `layer.animationEndTime` and sets `layer.alwaysDraw` for looping styles.
- It adds three child attributes (`parentAttribute` set, also pushed to `childAttributes`, so they update with the parent): `_<name>_start` (same size), `_<name>_start_time`, `_<name>_duration` (size 1).
- VS header: one GLSL function per distinct `easing.methodName` and size, from `easing.gpu` templated with `${easingMethod}` → `<type> <methodName>(<type> start, <type> end, float t)` and `${T}` → `<type>`.
- Destructuring: `_<name>_time` from `currentTime` (uniform from the `frame` module, auto-imported by `Layer.baseShaderModules` when any attribute eases) per loop style, then `<type> <name> = <methodName>(_<name>_start, _<name>_end, _<name>_time);`. The shader keeps using the original `<name>`.
- `validate` fails when an attribute has both `easing` and `resource`.

### Shaders30CompatibilityTransform

The default `BaseShaderTransform`; runs last on every VS/FS after comments are stripped.
WebGL2: `varying` → `out` (VS) / `in` (FS), `texture2D(` → `texture(`, `gl_FragColor` →
`_FragColor` plus a `layout(location = 0) out vec4 _FragColor;` line if none exists.
WebGL1: removes `#version 300 es`, `out` → `varying` (VS), `in` → `varying` (FS).

### Geometry, material, model, default scene

- `generateLayerGeometry(layer, maxInstancesPerBuffer, vertexAttributes, vertexCount, indexBuffer?)` — fills one `Float32Array(size * vertexCount)` per vertex attribute by calling `update(vertexIndex)`, wraps each in a GL `Attribute` and stores it on `attribute.materialAttribute`; builds the index buffer from `indexBuffer.update(i)` for `indexCount` entries, upgrading `UINT8`/`UINT16` to a wider array when `vertexCount` exceeds 256/65536, and stores it on `indexBuffer.materialIndexBuffer`. Called by `Layer.init` (`processVertexAttributes`); buffer managers reuse the stored `materialAttribute`s.
- `generateLayerMaterial(layer, vs, fs, uniforms, instancingUniforms)` — starts from `layer.getMaterialOptions()`, overlays the `materialOptions` prop, maps each view's FS to `view.renderTarget`, converts uniforms by `UniformSize` to `MaterialUniformType` with zeroed defaults, and adds generated instancing uniforms. Called by `BufferManagerBase.makeLayerMaterial`.
- `generateLayerModel(id, geometry, material, drawMode?)` — `new Model(...)`, `drawMode` defaulting to `TRIANGLE_STRIP`. Called by each buffer manager.
- `generateDefaultScene(gl)` — an orthographic `Camera` matching the canvas (scale `[1, -1, 1]`, so +y is down and (0,0) is top-left) and a full-canvas viewport; used by `LayerScene`.

## Extension points

Add an expander for a new attribute property:

```ts
class MyIOExpansion extends BaseIOExpansion {
  validate(layer, instanceAttributes) { /* log + return false on bad config */ return true; }
  expand(layer, instanceAttributes) {
    return { instanceAttributes: [/* derived attrs */], vertexAttributes: [], uniforms: [] };
  }
  processHeaderInjection(target, declarations, layer, metrics, va, ia, u) {
    if (target === ShaderInjectionTarget.VERTEX)
      this.setDeclaration(declarations, "myFn", "float myFn(float x) { return x; }\n", "MyIO");
    return { injection: "" };
  }
}
new Surface({ context, ioExpansion: (defaults) => [...defaults, new MyIOExpansion()] });
```

- Keep `BasicIOExpansion` in the list unless you replace all declaration writing yourself.
- A resource manager contributes expanders by overriding `BaseResourceManager.getIOExpansion()`.
- Add or replace transforms with `ISurfaceOptions.shaderTransforms` (`BaseShaderTransform`: `vertex`, `fragment`, optional `rawVertex`, `rawFragment`).

## Gotchas

- Expanders must not mutate their inputs (the base class says so), but `EasingIOExpansion` renames and rewraps the layer's own attribute objects: an attribute object returned from `initShader` is changed in place, so never share attribute objects between layers or reuse them across `initShader` calls.
- Easing attributes need an explicit `size`; each easing method instance needs a unique `uid` (reusing one logs an error). Two different easings with the same `methodName` and size on one layer collide on one GLSL function.
- Easing adds `size + 2` floats per instance per eased attribute (start value, start time, duration) on top of the `_<name>_end` value.
- `Shaders30CompatibilityTransform` uses regexes on whitespace-delimited `in`/`out`/`varying`; on WebGL1, a GLSL `in`/`out` parameter qualifier in the FS/VS is rewritten to `varying` and breaks compilation. Avoid parameter qualifiers in shared shader code.
- `IVertexAttribute.defaults` and `initWithBuffer` are declared in `ui/src/types.ts` but not read by `generateLayerGeometry`; all vertex data comes from `update(vertexIndex)`, which must return a flat number array.
- Uniform `shaderInjection` defaults to VERTEX: a uniform used in the FS must say `FRAGMENT` or `ALL`.

## Related

- [Shader processing](shader-processing.md) — where expanders and transforms are invoked.
- [Easing and animation](../instances/easing-and-animation.md) — the instance-side API of easing.
- [Buffer management overview](../buffers/overview.md) — the buffer strategies the declarations target.
- [Textures and atlases](../resources/textures-and-atlases.md) — `TextureIOExpansion` and resource attributes.
- [Scene, model and material](../gl/scene-model-material.md) — the GL objects generated here.
