---
title: Shader modules
summary: The global ShaderModule registry, the ${import: id} syntax, how modules contribute GLSL and Shader IO, and the built-in base modules a layer shader can import.
covers:
  - ui/src/shaders/base-modules
  - ui/src/shaders/processing/shader-module.ts
related:
  - shaders/shader-processing.md
  - 2d/view-and-camera.md
  - 3d/view-and-projection.md
  - interaction/picking.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

Shader modules are named, reusable chunks of GLSL that a shader pulls in with
`${import: id}`. A module can also contribute Shader IO — uniforms, instance attributes, vertex
attributes — so importing e.g. `camera` both makes the GLSL helpers available and causes the
system to declare and update the uniforms they use. The registry is global (one per JS context),
populated as a side effect of importing the module files.

## Key files

- `ui/src/shaders/processing/shader-module.ts` — `ShaderModule` (static `modules`, `register`, `analyzeDependents`, `process`), `IShaderCompileResults`.
- `ui/src/shaders/processing/shader-module-unit.ts` — `ShaderModuleUnit` (`moduleId`, `content`, `compatibility`, `description`, `isFinal`, `instanceAttributes`, `uniforms`, `vertexAttributes`, `lock`).
- `ui/src/shaders/base-modules/index.ts` — imports every built-in module file (registration side effects); pulled in by `ui/src/shaders/index.ts`.
- `ui/src/shaders/base-modules/instancing.shader.ts` — `instancing` (the `_active` attribute).
- `ui/src/shaders/base-modules/picking.shader.ts` — `picking` (the `_pickingColor` attribute and varying).
- `ui/src/shaders/base-modules/camera-metrics.shader.ts` — `camera`, `projection`.
- `ui/src/shaders/base-modules/frame-metrics.shader.ts` — `frame`, `time`.
- `ui/src/shaders/base-modules/math.shader.ts` — constants and math helpers, `constants` bundle.
- `ui/src/shaders/base-modules/matrix.shader.ts` — `translation`, `rotation`, `scale`, `transform`.
- `ui/src/shaders/base-modules/hsv.shader.ts`, `noise.shader.ts`, `random.shader.ts`, `pack-float.ts`, `util.shader.ts` — `hsv`, `simplexNoise2D`/`simplexNoise3D`, `random`, `packFloat`, `no-op`.
- `ui/src/shaders/base-modules/shader-fragments/` — the `.vs`/`.fs` GLSL bodies the modules register.
- `ui/src/shaders/base-modules/easing-methods.shader.ts` — empty file (easing GLSL is injected by `EasingIOExpansion`, see [IO expansion](io-expansion.md)).

## How it works

### Registration

`ShaderModule.register(unit | options | options[])` wraps options in a `ShaderModuleUnit` and
stores it in `ShaderModule.modules: Map<moduleId, { fs?, vs? }>`. `compatibility`
(`ShaderInjectionTarget.VERTEX`, `FRAGMENT` or `ALL`) decides which slot(s) it fills, so one id can
have different VS and FS implementations (`no-op` does). Re-registering an id overrides the
previous unit for the matching slot unless that unit has `isFinal: true`, in which case `register`
returns an error string (it never throws; `null` means success). The unit is then `lock()`ed:
setters for `content`, `moduleId`, `compatibility` warn and do nothing afterwards.

### Import syntax

Inside any layer shader or module content:

```glsl
${import: camera}
${import: PI, PI2, fsin,}   // comma separated, trailing comma allowed
```

The token is `import`, then `:` (whitespace allowed around it), then ids. The import line is
removed and the module content is placed above the importing content.

### Resolution (`ShaderModule.process(id, shader, target, additionalModules)`)

1. `additionalModules` (the layer's base modules) are prepended as `${import: …}` lines.
2. The shader is wrapped in a temporary unit (`Layer "<id>" vs|fs`) and resolved recursively.
3. For each unit, `analyzeDependents` runs `shaderTemplate` over its content once, collects the
   imported ids into `unit.dependents` and strips the import tokens (cached afterwards for locked
   units). Unknown ids, or ids with no unit for the requested target, produce error strings.
4. Dependencies are emitted depth-first before the unit's own content; each id is included at most
   once per shader (`included` set). A cycle produces `A Shader has detected a Circular dependency
   in import requests: a -> b -> a`.
5. Returns `{ errors, shader, shaderModuleUnits }`. `ShaderProcessor.processImports` aborts the
   layer on VS errors and drops the view's FS on FS errors.

The collected `shaderModuleUnits` (VS and all FS) are then asked for IO by `injectShaderIO`:
each unit's `instanceAttributes(layer)`, `uniforms(layer)`, `vertexAttributes(layer)` results are
appended to the layer's own IO (see [Shader processing](shader-processing.md)).

### Automatic imports

`Layer.baseShaderModules(shaderIO)` adds VS modules to every layer: `instancing` always,
`picking` when the layer's picking type is `PickType.SINGLE`, `frame` when any instance attribute
has `easing`. `Layer2D` adds `world2D` (`ui/src/2d/shader-modules/world-2d.shader.ts`); the 3D
modules `world2DXY`/`world2DXZ`/`world2DYZ` and `parent-transform` are registered under
`ui/src/3d/`. A layer's `baseShaderModules` prop can rewrite the list.

### Built-in modules

| Module id | Target | Provides |
|---|---|---|
| `instancing` | ALL | instance attribute `_active` (`o.active ? 1 : 0`) and sets `layer.shaderIOInfo.activeAttribute`; vertex attribute `instance` only when `layer.bufferType` is `UNIFORM` |
| `picking` | VERTEX | varying `_picking_color_pass_`; instance attribute `_pickingColor` (vec4 from `0xffffff - instance.uid`) |
| `camera` | ALL | uniforms `projection`, `viewProjection`, `view` (mat4), `cameraNear`, `cameraFar`, `cameraPosition`, `cameraScale`, `cameraRotation` (VS only), `viewSize`, `pixelRatio` (VS+FS), read from `layer.view.props.camera` |
| `projection` | ALL | imports `camera`; `cameraSpace`, `cameraSpaceDirection`, `cameraSpaceSize`, `clipSpace`, `clipSpaceDirection`, `clipSpaceSize` |
| `frame` | ALL | uniforms `currentTime`, `currentFrame` (VS+FS) from `layer.surface.frameMetrics` |
| `time` | ALL | uniform `time` (= `frameMetrics.currentTime`) |
| `random` | ALL | uniform `random`, a new `Math.random()` per draw |
| `PI`, `PI2`, `PI_2`, `PI_4`, `PI_INV`, `PI2_INV`, `toDegrees`, `toRadians` | ALL | `float` constants of the same name |
| `constants` | ALL | imports all of the constants above |
| `bezier1`, `bezier2`, `arc`, `fmod`, `wrap`, `fsin`, `fcos` | ALL | GLSL functions of the same name |
| `translation`, `rotation`, `scale`, `transform` | ALL | `mat4 translation(vec3)`, `rotationFromQuaternion(vec4)`, `scale(vec3)`, `transform(vec3 s, vec4 r, vec3 t)` |
| `hsv` | ALL | `rgb2hsv(vec3)`, `hsv2rgb(vec3)` |
| `simplexNoise2D`, `simplexNoise3D` | ALL | `simplexNoise2D(vec2)`, `simplexNoise3D(vec3)` |
| `packFloat` | ALL | `packFloat(float value, float range)`, `unpackFloat(vec4, float range)` |
| `no-op` | VS and FS | a complete `main()` writing zero position / transparent colour |

The `description` string of each unit documents its GLSL surface; read it in the module file.

## Extension points

Register a module from any file that is imported before layers initialise:

```ts
ShaderModule.register({
  moduleId: "myFog",
  description: "float fog(float depth)",
  compatibility: ShaderInjectionTarget.ALL,
  content: "${import: frame}\nfloat fog(float d) { return exp(-d * fogDensity); }",
  uniforms: (layer) => [{
    name: "fogDensity", size: UniformSize.ONE,
    shaderInjection: ShaderInjectionTarget.ALL, update: () => [0.01],
  }],
});
```

- `content` may itself contain `${import: …}`.
- `instanceAttributes(layer)`, `uniforms(layer)`, `vertexAttributes(layer)` are called once per importing layer during `Layer.init`; return `IInstanceAttribute`, `IUniform`, `IVertexAttribute` objects as in [Authoring a layer](authoring-a-layer.md).
- Set `isFinal: true` to forbid later overrides of the id; omit it to let applications swap implementations (registration order wins).
- `ShaderModuleUnitOptions` is `Partial<ShaderModuleUnit>` without `lock`.

## Gotchas

- Registration is a side effect of importing the module file. A module defined in a file nothing imports does not exist, and the import fails with `Could not find requested module`.
- `ShaderModule.register` reports failures by return value, not by exception — check it when overriding.
- Modules are de-duplicated by id only. `camera` and `world2D` both declare uniforms `projection`, `view`, `viewProjection`, `cameraPosition`, …, and `projection` and `world2D` both define `clipSpace` — a `Layer2D` already gets `world2D`, so do not also import `camera`/`projection` there.
- `simplexNoise2D` and `simplexNoise3D` both define `vec3 mod289(vec3)`; importing both into one shader redefines it. `simplexNoise3D` uses `1.0f` float suffixes, which GLSL ES 1.0 (WebGL1) rejects.
- Uniforms default to `ShaderInjectionTarget.VERTEX`: `camera`'s matrices are not declared in the FS even when the FS imports `camera`.
- `camera`'s `cameraRotation` uniform currently returns `camera.scale`.
- `instancing`'s `instance` vertex attribute depends on `layer.bufferType`, which still reports its default (`INSTANCE_ATTRIBUTE`) when module IO is gathered, so it is not added during initial processing.
- An imported module's IO callbacks run even if the shader never references the symbols, adding attributes/uniforms to every instance.

## Related

- [Shader processing](shader-processing.md) — where `ShaderModule.process` and module IO fit in the pipeline.
- [View and camera (2D)](../2d/view-and-camera.md) — `world2D` and `Layer2D`.
- [View and projection (3D)](../3d/view-and-projection.md) — the 3D projection modules.
- [Picking](../interaction/picking.md) — how the `picking` module's colour is used.
