---
title: Post processing
summary: PostProcessJSX and PostProcessLayer, the full-screen-quad pass over named render textures, and the effect helpers built on it: bloom, box sample, blur, trail, draw, noise, commands.
covers:
  - ui/src/base-surfaces/react-surface/processing
related:
  - react/react-surface.md
  - resources/color-buffers.md
  - resources/textures-and-atlases.md
  - surface/views-and-scenes.md
  - shaders/shader-modules.md
  - react/util-layers.md
status: complete
verified-at: d80bb72a
---

## Purpose

Post processing in the JSX surface is a chain of full-screen-quad passes. Each pass is a scene with
one `View2D` and one `PostProcessLayer` whose fragment shader samples named texture resources and
writes to the screen or to another texture resource. Effects (bloom, trail, blur, noise...) are
plain functions that return one or more such scenes, so a whole render-to-texture graph is declared
inside `SurfaceJSX` and wired purely by resource names.

## Key files

- `ui/src/base-surfaces/react-surface/processing/post-process-jsx.tsx` — `PostProcessJSX`, `IPostProcessJSX`: one pass = `SceneJSX` + `ViewJSX` + `LayerJSX(PostProcessLayer)`.
- `ui/src/base-surfaces/react-surface/processing/layer/post-process-layer.ts` — `PostProcessLayer`, `IPostProcessLayer`, `PostProcessInstance`.
- `ui/src/base-surfaces/react-surface/processing/commands-jsx.tsx` — `CommandsJSX`: a scene running a `CommandLayer` callback.
- `ui/src/base-surfaces/react-surface/processing/bloom/bloom-jsx.ts` — `BloomJSX`, `IBloomJSX`.
- `ui/src/base-surfaces/react-surface/processing/box-sample/box-sample-jsx.ts` — `BoxSampleJSX`, `BoxSampleJSXDirection`; shader `box-sample-jsx.fs`.
- `ui/src/base-surfaces/react-surface/processing/gauss-horizontal-blur/gauss-horizontal-blur-jsx.tsx` — `GaussHorizontalBlurJSX`.
- `ui/src/base-surfaces/react-surface/processing/gauss-vertical-blur/gauss-vertical-blur-jsx.ts` — `GaussVerticalBlurJSX`.
- `ui/src/base-surfaces/react-surface/processing/trail/trail-jsx.ts` — `TrailJSX`, `ITrailJSX`.
- `ui/src/base-surfaces/react-surface/processing/draw/draw-jsx.ts` — `DrawJSX`, `IDrawJSX`: blit a texture (or one channel) to screen.
- `ui/src/base-surfaces/react-surface/processing/draw/draw-debug-jsx.tsx` — `DrawDebugJSX`: up to 16 textures in a 4x4 grid of viewports.
- `ui/src/base-surfaces/react-surface/processing/simplex-noise/simplex-noise-jsx.tsx` — `SimplexNoiseJSX`, `ISimplexNoiseJSX`.

## How it works

### One pass: `PostProcessJSX`

`PostProcessJSX(props)` returns:

```tsx
<SceneJSX name={props.name}>
  <ViewJSX name="fullscreen" type={View2D} {...props.view} output={props.output}
    config={{ camera: new Camera2D(), viewport: 100% x 100%,
              materialSettings: { depthTest: false, culling: NONE }, ...props.view?.config }} />
  <LayerJSX name="postprocess" type={PostProcessLayer} uses={...} config={...} />
</SceneJSX>
```

- `buffers: Record<uniformName, resourceName | resourceName[]>` — `uses.names` is every resource
  name; `uses.apply` maps each key to the resolved `IRenderTextureResource` (or array) in
  `config.buffers`, then calls `onResources(resources)`.
- `shader` — a string (wrapped as one `FragmentOutputType.COLOR` output) or an
  `OutputFragmentShaderSource` array; passed as `PostProcessLayer` `fs`.
- `output` — the `ViewJSX` `output` (`{ buffers: { [FragmentOutputType.COLOR]: "texName" },
  depth: false }`); omitted = render to the screen.
- `uniforms` (array or `(layer) => IUniform[]`), `material` (→ layer `materialOptions`),
  `preventDraw`, `printShader`, `view` (extra `ViewJSX` props/config) pass through.

### `PostProcessLayer.initShader`

- Adds one `PostProcessInstance` (a dummy, `tint` only) to its provider and draws a 4-vertex
  `TRIANGLE_STRIP` quad with vertex attributes `vertex` (clip-space corners) and `tex` (0..1).
- The vertex shader writes `gl_Position = vec4(vertex, 0, 1)` and a varying named
  `textureCoordinateName` (default `texCoord`); the same varying is prepended to `fs[0].source`.
- For each `buffers` key it creates two fragment uniforms: `<key>` (`UniformSize.TEXTURE`) and
  `<key>_size` (`UniformSize.TWO`, texture width/height). Their `update` issues a
  `textureRequest({ key })` through `this.resource.request(...)` and returns `request.texture`, or a
  shared 2x2 empty `Texture` until the resource manager has delivered it.
- An array of resources for one key is selected by `surface.frameMetrics.currentFrame %
  length` — a per-frame ping-pong between textures.
- `getMaterialOptions()` is `CommonMaterialOptions.transparentImageBlending` with `depthTest:
  false`; the `material` prop (layer `materialOptions`) overrides it key by key.
- Shaders use the normal deltav shader pipeline, so `${import: camera}` (gives `viewSize`),
  `${import: time}`, `${import: simplexNoise2D/3D}` and `${out: color}` all work.

### Effects

All effects are functions returning `PostProcessJSX` results (one element or an array):

- **`BoxSampleJSX`** — `input` → `output` 4-tap box filter (`sourceTex`, uniform `delta` = 1 for
  `DOWN`, 0.5 for `UP`). Sizing comes from the output texture.
- **`BloomJSX`** — `resources[0]` is the glow source, `resources[1..samples]` progressively
  smaller targets. `samples` down passes `resources[i] → resources[i+1]` (no blending), then up
  passes `resources[i+1] → resources[i]` for `i = samples-1 .. 1` with additive blending
  (`One`/`One`/`Add`). With `compose`, a final pass adds `resources[1]` (glow) to `compose`
  (base); `gammaCorrection` switches to `mix(base, base + glow, (r+g+b) * gamma)`. Without
  `compose` the result stays in `resources[1]`.
- **`TrailJSX`** — pass `<name>_base`: alpha-composites `input.add` over `input.trail` into
  `output`; pass `<name>`: copies `output` back to `input.trail` multiplied by `intensity`
  (default 0.7), offset by `drift.direction / tex_size` when `drift` is set.
- **`DrawJSX`** — draws `input` to the screen or `output`; `channel` draws one channel (red-only,
  or gray with `grayScale`). Warns once (`emitOnce`) if the input texture has mipmaps enabled,
  a common cause of blank output.
- **`DrawDebugJSX`** — `inputs` (string or `{ key, depth, channels }`) drawn into 20% viewports
  in a 4x4 grid; `depth: true` false-colors a depth texture.
- **`SimplexNoiseJSX`** — writes grayscale noise to `output`; `scale` (one `Vec2` or an array for
  octaves). With `drift`: 3D noise animated by `time`, view `drawMode` `ALWAYS`. With `zOffset`:
  3D noise slice, `ON_TRIGGER` when `zOffset` changes. Neither: 2D noise, `FRAME_COUNT` 1.
- **`GaussHorizontalBlurJSX` / `GaussVerticalBlurJSX`** — 7-tap separable gaussian over `color`.
- **`CommandsJSX`** — `{ name, callback: CommandCallback }`: scene with a `View2D` and a
  `CommandLayer`, for injecting `Surface.commands` or raw GL in pipeline order.

### Ordering

`Surface.commit` renders `sceneDiffs.items` sorted by `sortByOrder` (pipeline order);
`SurfaceJSX` lists the `"root"` scene first, then `SceneJSX`/effect scenes in child order. Write passes in data-flow order: producer scene, then effects that
read its outputs. See `ui/stories/components/multi-render-target.stories.tsx` (`TrailJSX` +
`BloomJSX` over textures sized `TextureSize.SCREEN`) and `ui/stories/components/noise.stories.tsx`.

## Extension points

- **New effect**: a function `MyEffectJSX(props)` returning `PostProcessJSX({ name, buffers:
  { myTex: props.input }, output: props.output ? { buffers: { [FragmentOutputType.COLOR]:
  props.output }, depth: false } : undefined, shader, uniforms })`, or an array of such passes.
  Give every pass a unique `name` (it is the scene key).
- **Custom quad layer**: use `LayerJSX` with `type={PostProcessLayer}` directly and set
  `textureCoordinateName`, `buffers`, `fs`, `uniforms`.
- **Inputs and targets**: declare `TextureJSX`/`ColorBufferJSX`/`FloatTextureJSX` resources at the
  `SurfaceJSX` root and refer to them by `name`; a scene's `ViewJSX` `output` renders into them.
- **Blending**: `material: { blending: ... }` (e.g. `blending: null` turns blending off, as
  `TrailJSX` does).

## Gotchas

- **Call effects as functions, not tags**: `{BloomJSX({...})}`, never `<BloomJSX .../>`. These
  helpers have no `surfaceJSXType` and no children, so as elements they are dropped by
  `groupSurfaceChildren`. `SimplexNoiseJSX` calls `React.useRef`, so calling it inline runs a hook
  in the parent component; keep the call unconditional.
- Every resource named in `buffers` or `output` must exist at the surface root, otherwise the
  layer/view logs "requested a resource ... not found" and the pass is broken. `uses` accepts only
  render texture resources (`isRenderTextureResource`); color buffers can be view outputs but not
  post-process inputs.
- Do not make a pass sample the texture it renders into; the shipped effects always use two
  textures (`TrailJSX`: `trail` and `output`) or an array in `buffers` for per-frame ping-pong.
- `BloomJSX` needs `resources.length >= samples + 1`; `samples` must be at least 1. Its `output`
  prop is placed in `view.output`, which `PostProcessJSX` overrides with its own (undefined)
  `output`, so the compose pass renders to the screen regardless at this commit. Its `view` is
  applied only to the compose pass. Without `name` the scenes are named `undefined.box-down0`...
- `TrailJSX`'s `output` is required and always rendered into (its doc comment says otherwise);
  `intensity: 0` falls back to 0.7 because of `||`.
- `preventDraw` only makes `PostProcessLayer.shouldDrawView` return false, which sets
  `Layer.needsViewDrawn`; nothing in `ui/src` reads that flag (nor `alwaysDraw`, which
  `initShader` sets), so whether a pass redraws is decided by its view's `drawMode` (default
  `ALWAYS`). Use `view: { config: { drawMode: ... } }` to throttle a pass.
- The gaussian blur components are exported from the package index but unused by stories, and
  their `.fs` files declare `varying vec2 texCoord` themselves although `PostProcessLayer` also
  prepends it; the vertical blur steps by `1.0 / viewSize.x`. Treat them as unverified.
- `PostProcessLayer.defaultProps.fs` is a placeholder whose GLSL is missing a closing brace;
  always supply `fs`.
- `DrawJSX` input textures usually need `generateMipMaps: false` in `textureSettings`.

## Related

- [React surface](react-surface.md) — `SurfaceJSX`, `ViewJSX` `output`, `LayerJSX` `uses`.
- [Color buffers](../resources/color-buffers.md) and [Textures and atlases](../resources/textures-and-atlases.md) — the render targets passes read and write.
- [Views and scenes](../surface/views-and-scenes.md) — view `output`, `chain`, `drawMode`.
- [Shader modules](../shaders/shader-modules.md) — `${import: ...}` modules used by effect shaders.
- [Utility layers](util-layers.md) — other helper layers.
