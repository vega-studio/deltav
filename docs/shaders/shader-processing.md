---
title: Shader processing
summary: How a layer's initShader output becomes final GLSL: module imports, IO injection, attribute packing, ${out} fragment outputs, header/destructuring generation and shader transforms.
covers:
  - ui/src/shaders/processing
related:
  - shaders/shader-modules.md
  - shaders/io-expansion.md
  - shaders/authoring-a-layer.md
  - surface/layer.md
  - buffers/overview.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

A layer declares raw shaders plus Shader IO (instance attributes, vertex attributes, uniforms) in
`Layer.initShader`. The shader processing pipeline turns that declaration into a vertex shader and
one fragment shader per view that compile on the current hardware (WebGL1 or WebGL2, with or
without MRT), with every attribute and uniform declared, packed and destructured automatically.
Layer authors never write `attribute`/`uniform` declarations for their declared IO.

## Key files

- `ui/src/shaders/processing/shader-processor.ts` — `ShaderProcessor` (`process`, static `makeOutputFragmentShader`, `mergeOutputFragmentShaderForColor`, `mergeFragmentOutputsForMRT`), `IShaderProcessingResults`, `ProcessShaderImportResults`.
- `ui/src/shaders/processing/shader-module.ts` — `ShaderModule` registry and `${import: …}` resolution (see [Shader modules](shader-modules.md)).
- `ui/src/shaders/processing/shader-module-unit.ts` — `ShaderModuleUnit`, `ShaderModuleUnitOptions`.
- `ui/src/shaders/processing/inject-shader-io.ts` — `injectShaderIO`: gathers module IO, runs IO expansion, validates, sorts, packs.
- `ui/src/shaders/processing/pack-attributes.ts` — `packAttributes`: assigns `block`/`blockIndex` to instance attributes.
- `ui/src/shaders/processing/metrics-processing.ts` — `MetricsProcessing`: block counts and uniform-capacity metrics.
- `ui/src/shaders/processing/base-shader-io-injection.ts` — `BaseShaderIOInjection` (base of `BaseIOExpansion`), `ShaderDeclarationStatements`, `ShaderDeclarationStatementLookup`, `ShaderIOHeaderInjectionResult`.
- `ui/src/shaders/processing/base-io-sorting.ts` — `BaseIOSorting`: ordering of attributes/uniforms before packing.
- `ui/src/shaders/processing/base-shader-transform.ts` — `BaseShaderTransform`: raw and final string transforms.
- `ui/src/util/shader-templating.ts` — `shaderTemplate`: the `${token}` replacer and `void main()` body finder every step uses.
- `ui/src/shaders/template-vars.ts` — `templateVars` (only `attributes` is used by the processor).
- `ui/src/shaders/index.ts` — imports `base-modules` (side-effect registration) and re-exports `processing`.

## How it works

The driver is `Layer.init` (`ui/src/surface/layer.ts`). In order:

1. `Layer.initShader()` returns an `IShaderInitialization` (or `null` for a shell layer that renders nothing).
2. Every surface shader transform runs `rawVertex(vs)` / `rawFragment(fs)` on the untouched sources.
3. `cleanShaderIOElements` drops `null` entries from the IO lists (layers may return `null` to toggle IO).
4. `checkForDuplicateOutputTypes` normalises a string `fs` to `[{ outputType: COLOR, source }]`, applies the `mapOutput` prop and rejects two fragments with the same output type.
5. `processFragmentShadersForEachView` applies the `fs` prop override, injects the picking fragment (`PickType.SINGLE`) after the last output the view uses, and calls `ShaderProcessor.makeOutputFragmentShader` per view (step "Fragment outputs" below). It also creates the shared `ShaderDeclarationStatementLookup` (`vs`, `fs` per view, `destructure`).
6. `processLayerShaders` runs `new ShaderProcessor().process(...)` with `surface.getIOExpanders()`, `getShaderTransforms()` and `getIOSorting()`, and stores the result in `layer.shaderIOInfo`.
7. Vertex geometry and the buffer manager are created from `shaderIOInfo` (see [IO expansion](io-expansion.md) and [Buffers overview](../buffers/overview.md)).

`ShaderProcessor.process` then does:

1. **Imports** — `processImports` asks `layer.baseShaderModules(shaderIO)` (then `props.baseShaderModules`, if set) for extra module ids, and calls `ShaderModule.process` for the VS and for each view's FS. Module content is prepended to the shader; the `ShaderModuleUnit`s used are collected. A VS import error aborts processing (returns `null`); an FS import error skips only that view's fragment shader.
2. **IO injection** — `injectShaderIO` (below) returns the final, sorted, packed `instanceAttributes`, internal `vertexAttributes`/`uniforms` and optional `indexBuffer`; `layer.getLayerBufferType` fixes the buffering strategy.
3. **Metrics** — `MetricsProcessing.process` computes `instanceMaxBlock`, `blocksPerInstance`, `maxUniformsForInstancing` (`WebGLStat.MAX_VERTEX_UNIFORMS` minus uniform blocks), `maxInstancesPerUniformBuffer`, `totalInstanceUniformBlocks`.
4. **Headers and destructuring** — for each `BaseIOExpansion`, in surface order: `processHeaderInjection(VERTEX, …)` and `processAttributeDestructuring(…)`. Expanders write named entries into the declaration maps through `setDeclaration` (same key = override, logged on the `performance` debug channel) and may also return raw strings. The VS header is `all vs declarations + returned injections`; the destructuring block is `all destructure declarations + returned strings`.
5. **Assembly** — `processExtensions()` (`#version 300 es` when `WebGLStat.SHADERS_3_0`, `#extension GL_EXT_draw_buffers : require` when `WebGLStat.MRT_EXTENSION`) + `precision highp float;` + VS header + imported VS. `shaderTemplate` replaces `${attributes}` with the destructuring block; if the shader has no `${attributes}` token, `onMain` prepends the block to the body of `void main()`. Every other unresolved `${…}` token is removed.
6. **Fragment shaders** — per view: `processHeaderInjection(FRAGMENT, …)` into that view's FS declaration map, then extensions + precision + header + source, leftover tokens removed.
7. **Transforms** — every `BaseShaderTransform.vertex` / `.fragment` is applied (default: `Shaders30CompatibilityTransform`, see [IO expansion](io-expansion.md)).

The result (`IShaderProcessingResults`) carries `vs`, `fs` (Map of `View` → `{ source, outputTypes, outputNames }`), `materialUniforms`, `maxInstancesPerBuffer`, `modules`, and the final IO lists.

### injectShaderIO

1. `gatherIOFromShaderModules` appends each imported unit's `instanceAttributes(layer)`, `uniforms(layer)` and `vertexAttributes(layer)` to the layer's IO.
2. For each expander: if `validate(...)` returns true, `expand(...)` returns extra IO which is appended (an `indexBuffer` replaces the current one). Later expanders see earlier expanders' additions.
3. `validateInstanceAttributes` warns on missing names, duplicate names, a name shared with a vertex attribute, or a non-resource attribute without `size`.
4. Vertex attributes become `IVertexAttributeInternal` (`materialAttribute: null`), uniforms `IUniformInternal` (`materialUniforms: []`), the index buffer `IIndexBufferInternal`.
5. Sorting with `BaseIOSorting` (`sortInstanceAttributes` puts `resource` then `easing` attributes first, so parents update before dependants).
6. `packAttributes`: `ensureSizes` sets `size = 4` for resource attributes and otherwise infers a missing size by calling `update(new Instance({}))`; then a first-fit packing into 4-float blocks sets `block` and `blockIndex`. `InstanceAttributeSize.MAT4X4` takes 4 fresh consecutive blocks with `blockIndex = InstanceBlockIndex.INVALID`.
7. `layer.getLayerBufferType` decides `INSTANCE_ATTRIBUTE`/`VERTEX_ATTRIBUTE` (fits `WebGLStat.MAX_VERTEX_ATTRIBUTES`), the `_PACKING` variants (fits once packed into blocks), or `UNIFORM`. `shaderIO.instancing === false` selects the `VERTEX_*` variants. The type is cached on the layer after the first call.

### Fragment outputs (`${out: name}`)

A layer's `fs` is a string (one COLOR output) or an ordered list of `{ outputType, source }`
(`FragmentOutputType` values or custom numbers). Each source after the first is a continuation of
the ones before it: headers (everything outside `main`) are concatenated and `main` bodies are
concatenated into one `main`, so a later output can read variables an earlier one declared.
Comments are stripped first (`removeComments`), so a commented-out `${out: …}` is ignored.

`ShaderProcessor.makeOutputFragmentShader(declarationsVS, declarationsFS, viewOutputs, layerOutputs)`:

- **View with a single/no target** (`View.getOutputTargets()` absent or a string): `mergeOutputFragmentShaderForColor` merges sources up to the COLOR one (or up to the last one when no COLOR source exists). The COLOR `${out: name}` becomes `vec4 name = gl_FragColor`; other outputs become plain `vec4 name` locals.
- **View with an array of targets** (MRT): requires `WebGLStat.MRT`, else throws. Sources are merged up to the last one whose `outputType` a target wants; `mergeFragmentOutputsForMRT` turns each wanted `${out: name}` into `layout(location = i) out vec4 name;` (WebGL2, declared through `declarationsFS`) or `vec4 name = gl_FragData[i]` (`GL_EXT_draw_buffers`). Unwanted outputs become locals. A source with no `${out}` but a `gl_FragColor` write is treated as its output (`_FragColor`).
- Returns `null` when nothing can be produced; the view is then skipped by `Layer.processFragmentShadersForEachView`, which fails the layer only if no view got a shader.

## Extension points

- **Shader modules** — register reusable GLSL plus IO with `ShaderModule.register`; see [Shader modules](shader-modules.md).
- **IO expansion** — subclass `BaseIOExpansion` and pass it through `ISurfaceOptions.ioExpansion` (array replaces the defaults, function receives `DEFAULT_IO_EXPANSION()` and returns the list); resource managers add theirs via `getIOExpansion()`. See [IO expansion](io-expansion.md).
- **Shader transforms** — subclass `BaseShaderTransform` (`vertex`, `fragment` required; `rawVertex`, `rawFragment` optional) and pass via `ISurfaceOptions.shaderTransforms` (array or function of `DEFAULT_SHADER_TRANSFORM()`). Passing an array without `Shaders30CompatibilityTransform` drops the WebGL1/2 unification.
- **IO ordering** — replace `surface.ioSorting` (a `BaseIOSorting`) to change attribute/uniform order before packing.
- **Per-layer** — override `Layer.baseShaderModules` to auto-import modules for a layer class (as `Layer2D` adds `world2D`), or set the `baseShaderModules` prop per instance.
- **Debugging** — the `printShader` layer prop logs the final `shaderIOInfo`, VS and every per-view FS. `debug` channels: `shader-module-vs`, `shader-module-fs`, `performance`.

## Gotchas

- `ShaderProcessor.process` catches every exception, logs it with the layer id and returns `null`; the layer then fails to initialise. Read the console warnings, not a thrown error.
- Unresolved `${…}` tokens are silently deleted in the final VS/FS — a typo in `${import: …}` inside a module that was not resolved, or a misspelt `${attributes}`, produces no error from the templater (import errors are reported by `ShaderModule.process`).
- Only one `${out: name}` per fragment source; a second throws `Invalid Shader Format`. Names must be unique across sources and must not be `gl_FragColor`.
- Two fragment sources with the same `outputType` (after `mapOutput`) fail the layer. Declaring your own `FragmentOutputType.PICKING` source while also setting `picking: PickType.SINGLE` throws.
- The precision line is always `precision highp float;`; a precision line in the layer's own shader is kept too (harmless duplicate).
- `gatherIOFromShaderModules` warns about duplicate names from modules but does not remove them (its `filter` results are discarded); the header de-duplicates declarations by name, but both entries stay in the IO lists. Avoid name clashes between layer IO and imported modules (e.g. `camera` and `world2D` both declare `projection`, `view`, …; import only one).
- FS header injections that return `material` uniforms are not merged into `materialUniforms` (the merge loop iterates the existing list instead of the FS result). Only VS header material uniforms reach the material.
- The final transforms run inside the per-view FS loop and re-apply `vertex()` to the same VS string once per view; transforms must be idempotent (the default one is).
- MRT views on hardware without MRT throw; there is no fallback.

## Related

- [Shader modules](shader-modules.md) — the `${import: …}` registry and built-in modules.
- [IO expansion](io-expansion.md) — the expanders, the WebGL1/2 transform and geometry/material generation.
- [Authoring a layer](authoring-a-layer.md) — the `initShader` contract from the layer author's side.
- [Layer](../surface/layer.md) — `Layer.init` lifecycle that drives this pipeline.
- [Buffers overview](../buffers/overview.md) — what the chosen `LayerBufferType` does next.
