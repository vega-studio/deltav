---
title: 3D layers
summary: Catalog of the built-in 3D layers (cube, triangle) and their instance properties.
covers:
  - ui/src/3d/layers
related:
  - 3d/scene-graph.md
  - 3d/view-and-projection.md
  - shaders/authoring-a-layer.md
  - surface/layer.md
status: complete
verified-at: 7323839e
---

## Purpose

Two minimal built-in layers draw primitives positioned by the 3D scene graph: `CubeLayer`
(unit cube, 36 vertices) and `TriangleLayer` (one triangle, 3 vertices). Each instance is an
`Instance3D` subclass, so its placement comes from its `Transform`'s world matrix. They are
reference implementations of a transform-driven layer more than production renderers: neither
applies its instance `color`.

## Key files

- `ui/src/3d/layers/cube/cube-layer.ts` — `CubeLayer`, `ICubeLayerProps`.
- `ui/src/3d/layers/cube/cube-instance.ts` — `CubeInstance`, `ICubeOptions` (`size`, `color`).
- `ui/src/3d/layers/cube/cube-layer.vs`, `ui/src/3d/layers/cube/cube-layer.fs` — cube shaders.
- `ui/src/3d/layers/triangle/triangle-layer.ts` — `TriangleLayer`, `ITriangleLayerProps`.
- `ui/src/3d/layers/triangle/triangle-instance.ts` — `TriangleInstance`, `ITriangleOptions` (`size`, `color`).
- `ui/src/3d/layers/triangle/triangle-layer.vs`, `ui/src/3d/layers/triangle/triangle-layer.fs` — triangle shaders.
- `ui/src/3d/layers/index.ts` — barrel; exports the cube only.

## How it works

Both layers extend `Layer` directly (not `SceneGraphLayer`) and set
`materialOptions: CommonMaterialOptions.transparentShapeBlending` in `defaultProps`, with an
empty `InstanceProvider` as `data`.

### CubeLayer

| Shader input | Kind | Source |
|---|---|---|
| `transform` | instance `MAT4X4` | `(o.transform \|\| IdentityTransform).matrix` |
| `size` | instance `THREE` | `CubeInstance.size` (default `[1, 1, 1]`) |
| `position` | vertex `THREE` | cube corners at ±1 (so a size of 1 gives a 2-unit cube) |
| `normal` | vertex `THREE` | face normal |
| `texCoord` | vertex `TWO` | per-face UVs |

`initShader` returns `drawMode: TRIANGLES`, `vertexCount: 36` and a single fragment output of type
`FragmentOutputType.COLOR`. The vertex shader imports `projection` and computes
`gl_Position = clipSpace((transform * vec4(position * size, 1.0)).xyz)`. The fragment shader
paints faces red with black edges (UVs within 0.01 of a border). `getMaterialOptions` returns
`transparentShapeBlending` plus `cullSide: GLSettings.Material.CullSide.CCW` (see Gotchas).

### TriangleLayer

Instance attributes `transform` (`MAT4X4`, as above) and `size` (`ONE`, `TriangleInstance.size`,
default 1); vertex attributes `position` (`[0,1,0]`, `[1,-1,0]`, `[-1,-1,0]`) and a constant
`normal` `[0, 0, 1]`. `vertexCount: 3`, `drawMode: TRIANGLES`; `getMaterialOptions` adds
`cullSide: GLSettings.Material.CullSide.NONE`. The fragment shader outputs solid red; the vertex shader also
sets `gl_PointSize = 20.0`.

### Data flow

Changing a `CubeInstance` / `TriangleInstance` transform (e.g. `instance.localPosition = …`)
invalidates its `Transform`; the transform update writes the new world matrix into the instance's
observable `_matrix`, the instance is marked changed, and the `transform` attribute re-reads
`transform.matrix` on the next diff. See [3D scene graph](scene-graph.md).

Typical use: a `View3D` with a camera, a `CubeLayer` fed by an
`InstanceProvider<CubeInstance>`, and instances created with
`new CubeInstance({ size: [1, 1, 1], parent?: someInstance3D })`.

## Extension points

- **Own 3D layer:** copy this pattern — an `Instance3D` subclass with `@observable` fields plus
  `makeObservable(this, MyInstance)`, a `Layer` whose `initShader` declares a `MAT4X4` instance
  attribute from `transform.matrix`, and a VS that uses `${import: projection}` and `clipSpace`.
  The storybook keeps richer variants (e.g. `ui/stories/components/layers/cube/cube-layer.ts`,
  `ui/stories/components/layers/cube-lighting/cube-instance.ts`).
- **Per-layer parent transform:** extend `SceneGraphLayer` instead of `Layer` and multiply by
  `parentTransform` in the VS.
- **Colour:** to honour `color`, add a `color` instance attribute and a varying; the built-in
  shaders ignore it.

## Gotchas

- `color` on `CubeInstance` / `TriangleInstance` is stored but never sent to the GPU; output is
  always red (cube: red with black edges).
- `TriangleLayer` / `TriangleInstance` are not exported from `ui/src/3d/layers/index.ts`, so they
  are not reachable from the package root; import them by file path inside the repo.
- Cube vertices span ±1, so `size` is a half-extent: `size: [1, 1, 1]` draws a 2×2×2 cube.
- Culling: the material option is named `culling` (`ui/src/gl/material.ts`); the `cullSide` key
  both layers add in `getMaterialOptions` is not read. Moreover `generateLayerMaterial` applies the
  `materialOptions` prop over `getMaterialOptions()`, and the default prop
  (`transparentShapeBlending`) sets `culling: CullSide.NONE`. Net effect: neither layer culls
  unless you pass `materialOptions` with a `culling` value.

## Related

- [3D scene graph](scene-graph.md) — `Instance3D`, `Transform`, `IdentityTransform`.
- [3D view and projection](view-and-projection.md) — `View3D` and the camera these layers render with.
- [Authoring a layer](../shaders/authoring-a-layer.md) — attributes, vertices and shader structure in general.
- [Layer](../surface/layer.md) — `Layer` lifecycle, `initShader`, `getMaterialOptions`.
