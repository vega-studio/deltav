---
title: Authoring a layer
summary: Recipe for a custom layer, modelled on CircleLayer: instance class, layer class, the initShader return shape, .vs/.fs files with ${out} outputs, helper creators, and adding the layer to a scene.
covers:
  - ui/src/util/create-attribute.ts
  - ui/src/util/create-uniform.ts
  - ui/src/util/create-vertex.ts
  - ui/src/util/shader-templating.ts
  - ui/src/2d/layers/circles
related:
  - surface/layer.md
  - shaders/shader-processing.md
  - shaders/shader-modules.md
  - 2d/layers.md
  - instances/instances.md
status: complete
verified-at: d80bb72a
---

## Purpose

A layer renders every instance of one `InstanceProvider` with one shader program. Writing a layer
means: an `Instance` subclass holding observable per-item data, a `Layer` subclass whose
`initShader` maps that data to GPU inputs, and GLSL that uses those inputs by name. The framework
writes all declarations, buffering, packing and easing (see [Shader processing](shader-processing.md)).
This doc is the author-side contract; [Layer](../surface/layer.md) covers the lifecycle.

## Key files

- `ui/src/2d/layers/circles/circle-instance.ts` — `CircleInstance`, `ICircleInstanceOptions`: the worked example's instance.
- `ui/src/2d/layers/circles/circle-layer.ts` — `CircleLayer`, `ICircleLayerProps`: `initShader`, `getMaterialOptions`, `defaultProps`, `attributeNames`.
- `ui/src/2d/layers/circles/circle-layer.vs`, `circle-layer.fs` — quad-based shaders (6 vertices, `TRIANGLES`).
- `ui/src/2d/layers/circles/circle-layer-points.vs`, `circle-layer-points.fs` — `POINTS` variant (1 vertex, `gl_PointCoord`).
- `ui/src/util/create-attribute.ts` — `createAttribute`: typed identity helper for `IInstanceAttribute`.
- `ui/src/util/create-uniform.ts` — `createUniform`: typed identity helper for `IUniform`.
- `ui/src/util/create-vertex.ts` — `createVertex`: typed identity helper for `IVertexAttribute`.
- `ui/src/util/shader-templating.ts` — `shaderTemplate`, `IShaderTemplateOptions`, `IShaderTemplateResults`: the `${token}` engine behind `${import}`, `${out}`, `${attributes}`.
- `ui/src/util/create-layer.ts` — `createLayer`, `createChildLayer`: build a `LayerInitializer`.

## How it works

### 1. The instance

```ts
export class CircleInstance extends Instance {
  @observable color: [number, number, number, number] = [1, 1, 1, 1];
  @observable depth = 0;
  @observable radius = 0;
  @observable center: Vec2 = [0, 0];
  constructor(options: ICircleInstanceOptions) {
    super(options);
    makeObservable(this, CircleInstance);
    // copy options onto fields
  }
}
```

Only `@observable` fields trigger buffer updates when changed; call `makeObservable(this, Class)`
in the constructor. See [Instances](../instances/instances.md).

### 2. The layer class

```ts
export class CircleLayer<T extends CircleInstance, U extends ICircleLayerProps<T>>
  extends Layer2D<T, U> {
  static defaultProps: ICircleLayerProps<CircleInstance> = {
    data: new InstanceProvider<CircleInstance>(), key: "" };
  initShader(): IShaderInitialization<CircleInstance> { /* below */ }
  getMaterialOptions() { return CommonMaterialOptions.transparentShapeBlending; }
}
```

- Extend `Layer2D` (`ui/src/2d/view/layer-2d.ts`) for 2D views: it auto-imports the `world2D` module (`clipSpace`, `cameraScale2D`, `viewSize`, `pixelRatio`, …). Extend `Layer` directly for anything else and import the projection modules you need.
- `static defaultProps` is required by `createLayer`/`LayerJSX` (they fill `key`/`data` from it).
- `getMaterialOptions()` returns `ILayerMaterialOptions` (blending, culling, depth); the `materialOptions` prop overrides it.

### 3. `initShader` return shape (`IShaderInitialization<T>`)

| Field | Meaning |
|---|---|
| `vs` | Vertex shader source string (usually an imported `.vs` file) |
| `fs` | A string (COLOR output) or ordered `{ outputType: FragmentOutputType \| number, source }[]` |
| `instanceAttributes` | `IInstanceAttribute<T>[]` (nulls allowed): `name`, `size` (`InstanceAttributeSize`), `update(instance)` returning a number array; optional `easing`, `resource`, `qualifier` |
| `vertexAttributes` | `IVertexAttribute[]`: `name`, `size` (`VertexAttributeSize`), `update(vertexIndex)` returning a number array |
| `uniforms` | `IUniform[]`: `name`, `size` (`UniformSize`), `update(uniform)` called every frame before draw, `shaderInjection` (default VERTEX) |
| `vertexCount` | Vertices per instance |
| `drawMode` | `GLSettings.Model.DrawMode`, default `TRIANGLE_STRIP` |
| `indexBuffer` | Optional `IIndexBuffer` (`size`, `indexCount`, `update(i)`) |
| `instancing`, `baseBufferGrowthRate` | Buffering hints (default `true`, `1000`) |

Return `null` for a shell layer that renders nothing (e.g. one that only spawns `childLayers()`).

CircleLayer's version, condensed:

```ts
const vertexToNormal = [1, 1, -1, -1, 1, -1];
const vertexToSide = [-1, 1, -1, 1, 1, -1];
return {
  instancing: this.props.bufferManagement?.instancing,
  baseBufferGrowthRate: this.props.bufferManagement?.baseBufferGrowthRate,
  drawMode: usePoints ? GLSettings.Model.DrawMode.POINTS : GLSettings.Model.DrawMode.TRIANGLES,
  vs: usePoints ? CircleLayerPointsVS : CircleLayerVS,
  fs: [
    { outputType: FragmentOutputType.COLOR, source: CircleLayerFS },
    { outputType: FragmentOutputType.GLOW, source: "void main() { ${out: glow} = color; }" },
  ],
  instanceAttributes: [
    { easing: animateCenter, name: "center", size: InstanceAttributeSize.TWO, update: (c) => c.center },
    { easing: animateRadius, name: "radius", size: InstanceAttributeSize.ONE, update: (c) => [c.radius] },
    { name: "depth", size: InstanceAttributeSize.ONE, update: (c) => [c.depth] },
    { easing: animateColor, name: "color", size: InstanceAttributeSize.FOUR, update: (c) => c.color },
  ],
  uniforms: [{ name: "layerOpacity", size: UniformSize.ONE,
    shaderInjection: ShaderInjectionTarget.ALL, update: () => [opacity()] }],
  vertexAttributes: [{ name: "normals", size: VertexAttributeSize.TWO,
    update: (v) => [vertexToNormal[v], vertexToSide[v]] }],
  vertexCount: usePoints ? 1 : 6,
};
```

`easing: undefined` simply disables easing for that attribute, so props can toggle animation.

### 4. The shaders

Shader files are plain strings: `import CircleLayerVS from "./circle-layer.vs";` (typed by
`declare module "*.vs"` / `"*.fs"` in `dts/asset.d.ts`). Write GLSL ES 1.0 style (`varying`,
`texture2D`, `gl_FragColor` or `${out}`, no attribute/uniform declarations for declared IO); `Shaders30CompatibilityTransform` converts
to ES 3.0 when WebGL2 is active.

`circle-layer.vs` uses `center`, `radius`, `depth`, `color` (instance attributes), `normals` (vertex
attribute), `layerOpacity` (uniform) and `clipSpace`, `cameraScale2D`, `viewSize`, `pixelRatio`
(from `world2D`) without declaring any of them. Only its own `varying`s are declared. Attribute
destructuring is inserted at the top of `main()`; put `${attributes}` in `main` to place it
elsewhere. Pull extra GLSL with `${import: id}` (see [Shader modules](shader-modules.md)).

`circle-layer.fs` writes its colour through `${out: color} = …;`, which declares `vec4 color` and
binds it to the COLOR target; the GLOW source then reads `color`, because later fragment sources
are appended into the same `main()`.

### 5. Using the layer

```tsx
const provider = React.useRef<InstanceProvider<CircleInstance>>(null);
<SurfaceJSX>
  <ViewJSX name="main" type={View2D} config={{ camera: new Camera2D() }} />
  <LayerJSX type={CircleLayer} providerRef={provider} config={{}} />
</SurfaceJSX>
// once mounted:
provider.current?.add(new CircleInstance({ center: [10, 10], radius: 5 }));
```

`LayerJSX` builds the `createLayer` initializer (a `LayerInitializer`, `ISceneOptions.layers`
entry) and `SurfaceJSX` hands it to the internal `Surface.pipeline` — see
[React surface](../react/react-surface.md), [2D layers](../2d/layers.md) and
[Layer](../surface/layer.md).

## Extension points

- New props: extend `ILayer2DProps<T>`/`ILayerProps<T>` and read `this.props` inside `initShader`. `initShader` runs only when the layer is built, so a prop that changes the IO or shaders must trigger `this.rebuildLayer()` from `willUpdateProps(newProps)` (the base class does this only for `picking`). Values read inside `update` callbacks (like `opacity()`) need no rebuild.
- Multiple outputs: add `{ outputType, source }` entries; views with matching output targets get them, and `mapOutput` remaps per layer instance.
- Picking: set the `picking: PickType.SINGLE` prop; the `picking` module and fragment are injected for you.
- Helper creators: `createAttribute<T>({...})`, `createUniform({...})`, `createVertex({...})` only add typing; they return the object unchanged. `createEasingAttribute` (`ui/src/surface/layer-processing/base-io-expanders/easing-io-expansion.ts`) does the same for eased attributes.
- `shaderTemplate({ shader, options, required, onToken, onMain, onError })` is usable for your own templating: `options` maps tokens to values, `onToken(token, replace)` can override each replacement, `onMain(body, header)` edits the `void main()` body, `required` reports missing tokens.

## Gotchas

- Do not declare instance attributes, vertex attributes or uniforms from `initShader` in the GLSL: the processor declares them and a duplicate declaration fails compilation. Do declare your own varyings.
- Attribute and uniform names are global in the program: they must not clash with each other, with module IO (`_active`, `_pickingColor`, `world2D` uniforms like `projection`, `viewSize`) or with GLSL keywords. An instance attribute and a vertex attribute may not share a name.
- Give every instance attribute a `size`; without it the packer calls `update(new Instance({}))` to guess, which throws for accessors that read fields of your subclass. Easing attributes require `size` and at most 4 floats.
- `update` must return arrays (`[c.radius]`, not `c.radius`); vertex `update` must return a flat number array.
- Uniforms used in the fragment shader need `shaderInjection: FRAGMENT` or `ALL` (`layerOpacity` uses `ALL`).
- `${out: name}` appears once per fragment source. Commented-out `${…}` tokens are ignored in fragment sources because comments are stripped first.
- `CircleLayer` does not override `willUpdateProps`, so changing `usePoints` or `animate` on an existing circle layer has no effect until it is rebuilt.
- `POINTS` rendering depends on hardware max point size and can be culled at viewport edges (noted on `ICircleLayerProps.usePoints`).
- Set the `printShader` prop to log the generated GLSL when debugging.

## Related

- [Layer](../surface/layer.md) — lifecycle, props, rebuilds.
- [Shader processing](shader-processing.md) — what happens to the `initShader` result.
- [Shader modules](shader-modules.md) — importable GLSL and IO.
- [2D layers](../2d/layers.md) — the other built-in 2D layers to copy from.
- [Instances](../instances/instances.md) — observables and instance lifecycle.
