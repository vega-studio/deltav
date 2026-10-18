---
title: 2D layers
summary: Catalog of the built-in 2D layers (arcs, circles, edges, images, rectangles, rings, vertex points) and their instance properties.
covers:
  - ui/src/2d/layers
related:
  - 2d/labels.md
  - 2d/view-and-camera.md
  - shaders/authoring-a-layer.md
  - instances/instances.md
  - instances/easing-and-animation.md
  - resources/textures-and-atlases.md
status: complete
verified-at: 3c259f7a
---

## Purpose

The built-in 2D layers are ready-made `Layer2D` subclasses, each paired with an `Instance`
subclass whose `@observable` properties feed instance attributes. They are both the stock shapes of
the library and the reference examples of how a layer is written. This doc is a catalogue: one
section per layer with its instance properties, what it draws and its options. Text (labels,
glyphs, text areas) has its own doc, [Labels](labels.md).

## Key files

- `ui/src/2d/layers/index.ts` — barrel: arcs, circles, edges, images, labels, rectangle, rings (not vertex-points).
- `ui/src/2d/types.ts` — `AnchorType`, `Anchor`, `ScaleMode` (`ALWAYS = 1`, `BOUND_MAX = 2`, `NEVER = 3`).
- `ui/src/2d/layers/arcs/` — `ArcLayer`, `ArcInstance`, `ArcScaleType`.
- `ui/src/2d/layers/circles/` — `CircleLayer`, `CircleInstance`.
- `ui/src/2d/layers/edges/` — `EdgeLayer`, `EdgeInstance`, `EdgeType`, `EdgeScaleType`, `EdgeBroadphase`; GLSL in `shader/`.
- `ui/src/2d/layers/images/` — `ImageLayer` (resource manager), `ImageRenderLayer` (drawing), `ImageInstance`, `ImageVideoResource`, `isVideoResource`.
- `ui/src/2d/layers/rectangle/` — `RectangleLayer`, `RectangleInstance`.
- `ui/src/2d/layers/rings/` — `RingLayer`, `RingInstance`.
- `ui/src/2d/layers/vertex-points/vertex-points-layer.ts` — `VertexPointsLayer` (custom-shader point cloud).

## How it works

Every layer follows the same pattern (details in [Authoring a layer](../shaders/authoring-a-layer.md)):
`initShader()` returns an `IShaderInitialization` with `vs`/`fs` (imported `.vs`/`.fs` files), a
static `vertexAttributes` list describing one template quad/strip (`normals` or `vertex`), and
`instanceAttributes` whose `update(instance)` reads instance fields. Optional `easing` on an
attribute comes from the layer's `animate` prop (an `IAutoEasingMethod` per property, see
[Easing and animation](../instances/easing-and-animation.md)). Each layer exposes
`static attributeNames` (the attribute names, handy for easing lookups) and `static defaultProps`.
Vertex shaders project with `clipSpace` from the `world2D` module
([2D view and camera](view-and-camera.md)). Most layers use
`CommonMaterialOptions.transparentShapeBlending`; image and glyph layers use
`transparentImageBlending`.

Common instance fields: `depth` (z, draw ordering) and an RGBA `color` in 0–1.

### Anchors and scale modes (rectangles, images; labels too)

`Anchor` = `{ type: AnchorType, padding, x?, y? }`. `setAnchor(anchor)` computes `x/y` from the
instance size: `TopLeft` → `(-padding, -padding)`, `Middle` → centre, `BottomRight` →
`(w + padding, h + padding)`, `Custom` keeps the given `x/y`. The instance's `position`/`origin`
lands on that anchor point. The anchor is computed once, from the size at the time of the call.

`ScaleMode` decides how the shape reacts to `cameraScale2D`:
`ALWAYS` — pure world space, grows with zoom; `BOUND_MAX` — grows until its on-screen size
reaches its nominal `size` in pixels, then stays that size; `NEVER` — always its nominal pixel
size. Scaling is about the anchor.

### ArcLayer (`ArcInstance`)

Draws thick arc segments (pie-slice outlines, gauges) as a 150-segment triangle strip.
Instance: `center: Vec2`, `radius` (to the middle of the stroke), `angle: Vec2` (start, end in
radians), `angleOffset` (added to both angles; handy to animate rotation), `thickness: Vec2`
(start→end width), `colorStart`, `colorEnd` (gradient along the arc), `depth`.
Props: `scaleType?: ArcScaleType` (`NONE` world space; `SCREEN_CURVE` meant for pixel-space
thickness), `animate` for `angle`, `angleOffset`, `center`, `colorStart`, `colorEnd`, `radius`,
`thickness`. Culling is disabled.

### CircleLayer (`CircleInstance`)

Anti-aliased filled circles: a quad per instance, round edge in the fragment shader.
Instance: `center`, `radius` (world units, scaled by `cameraScale2D.x` only), `color`, `depth`;
`width`/`height` getters return `2 * radius`.
Props: `usePoints` (render with GL `POINTS`, one vertex each: much faster, but capped by the
GPU's max point size and culled when the centre leaves the viewport), `opacity(): number`
(uniform `layerOpacity`), `animate` for `center`, `radius`, `color`, and
`bufferManagement.instancing` / `baseBufferGrowthRate` passed to the buffering strategy. Has a
second `FragmentOutputType.GLOW` output (the colour) for multi-render-target pipelines.

### EdgeLayer (`EdgeInstance`)

Lines and Bézier curves between two points with per-end width and colour.
Instance: `start`, `end`, `control: Vec2[]` (two control points), `thickness: Vec2`
(start/end), `startColor`, `endColor`, `depth`; helpers `length`, `perpendicular`,
`setEdgeThickness(n)`, `setColor(c)`.
Props:
- `type: EdgeType` (required) — `LINE`, `BEZIER` (uses `control[0]`), `BEZIER2` (both
  controls), and `LINE_THIN` / `BEZIER_THIN` / `BEZIER2_THIN`, which draw a 1px GL
  `LINE_STRIP` with no thickness (cheapest). Thick types are `TRIANGLE_STRIP`s.
- `scaleType: EdgeScaleType` — `NONE`: everything in world space; `SCREEN_CURVE`: end points in
  world space but thickness and controls in pixels, controls are deltas from the start/end
  points (`control[0]` from `start`, `control[1]` from `end`; y is negated so +y points down,
  as in the world), all multiplied by `scaleFactor()`.
- `smoothness` (segments per curve, default 50; `LINE` always uses 2), `opacity` (number),
  `scaleFactor(): number`, `animate` for `start`, `end`, `startColor`, `endColor`, `control`,
  `thickness`.
The vertex shader is assembled with `shaderTemplate`: the per-type `interpolation()` function
(`edge-layer-line.vs`, `-bezier.vs`, `-bezier2.vs`) is injected into the world or screen
shader. Thick edges compute mitred normals from neighbouring samples.

### ImageLayer (`ImageInstance`)

Textured quads from an atlas (see [Textures and atlases](../resources/textures-and-atlases.md)).
`ImageLayer` has no shader (`initShader()` returns `null`); it is a manager whose `draw()`
reads the provider's diffs, builds one shared `atlasRequest` per source (dedup via
`sourceToRequest`), issues disposal requests when a source changes or an instance is removed,
then hands the same provider to its child `ImageRenderLayer` (created in `childLayers()`), which
draws.
Instance: `source: ImageInstanceResource` (URL string, `HTMLImageElement`, canvas,
`ImageBitmap`, `ImageData`, or `{ videoSrc, autoPlay? }`), `origin` (world position of the
anchor), `width`, `height` (world units; default 1), `maxSize` (get/set, keeps aspect),
`tint` (multiplies the texel), `scaling: ScaleMode` (default `BOUND_MAX`), `rotation` (radians),
`depth`, `anchor`/`setAnchor`, `onReady(image, video?)`. After the resource loads,
`resourceTrigger` fills `sourceWidth`/`sourceHeight` and calls `onReady`.
Props: `atlas` (atlas resource key, default `"default"`), `rasterizationScale` (e.g. 0.5 loads
sources at half size), `enableRotation` (switches to `image-layer-rotation.vs`, adds a
`rotation` attribute and **disables scale modes**), `animate` for `tint`, `location`, `size`,
`rotation`.
Video: the layer creates a muted `<video>`, shows a white pixel tinted by `tint` until
`loadedmetadata` and `loadeddata` fire, then swaps the source back; `image.videoLoad()` starts
loading within a user gesture when autoplay is blocked. While any used video is playing the layer
sets `alwaysDraw`. Enable `localStorage.debug = 'video'` to log video events (`debug-video.ts`).

### RectangleLayer (`RectangleInstance`)

Solid or outlined boxes with anchors and scale modes.
Instance: `position` (where the anchor lands), `size: Vec2`, `color`, `outline` (inner outline
width; 0 = filled), `outlineColor`, `scaling` (default `BOUND_MAX`), `scale` (uniform
multiplier), `maxScale` (lets `BOUND_MAX` grow beyond nominal size), `depth`,
`anchor`/`setAnchor`.
Props: `scaleFactor(): number` (divides the size used for the scale-mode test), `animate` for
`color`, `location`, `size`, `outline`, `outlineColor`.

### RingLayer (`RingInstance`)

Circle outlines. Instance: `center`, `radius` (outer), `thickness` (default 1, minimum 2 in the
shader), `color`, `depth`; getters `width`, `height`, `innerRadius`.
Props: `scaleFactor(): number` (multiplies the radius), `animate` for `color`, `center`,
`radius`. The radius is in **screen pixels** (`radius * scaleFactor * pixelRatio`), not affected
by camera zoom; only the centre is in world space.

### VertexPointsLayer

A GPGPU helper: draws `numPoints` vertices as GL `POINTS` with your own `vs`/`fs`. Each vertex
gets `vertexIndex` (float) and, when `dataSourceSize: { attributeName, width, height }` is given,
a `vec2` UV `attributeName` so the point can sample its data from a float texture. `resources`
maps sampler uniform names to `IRenderTextureResource`s (an array is cycled one per frame,
`currentFrame % length`, for ping-pong buffers); `<name>_size` (vec2) is injected alongside.
The layer adds one dummy `Instance2D` to its provider so a single instance renders.

## Extension points

- Subclass a layer and override `initShader()` (call `super.initShader()` and edit the result)
  or `getMaterialOptions()` for different blending/culling.
- Subclass an instance (e.g. `class MyCircle extends CircleInstance`) to carry app data;
  the layer generics (`CircleLayer<T extends CircleInstance, ...>`) accept it.
- `LabelLayer.customGlyphLayer` / `TextAreaLayer.customGlyphLayer` swap the glyph renderer (see
  [Labels](labels.md)).
- New shapes: copy the closest layer; the pattern is documented in
  [Authoring a layer](../shaders/authoring-a-layer.md).

## Gotchas

- Instance constructors use `options.x || default`, so passing `0` (e.g. `depth: 0`,
  `radius: 0`) falls back to the default, which is harmless only when the default is 0.
- Subclass `defaultProps` are not merged into props by the `Layer` constructor (only `key` and
  `data` are filled in by `createLayer`); values like `ArcLayer.defaultProps.scaleType` are
  documentation, the code uses its own inline fallbacks.
- `ArcInstance` ignores an `angleOffset` option (it is not in `IArcInstanceOptions`; set the
  property after construction). `ArcScaleType.SCREEN_CURVE` selects `arc-layer-screen-space.vs`,
  which reads an attribute named `position` while the layer declares `vertex`, and ignores
  `angleOffset`; treat it as unusable.
- `EdgeScaleType.SCREEN_CURVE` with a `*_THIN` type uses `edge-layer-screen-curve-thin.vs`, whose
  `${interpolation}` token is malformed (`{ interpolation }`); expect a template/compile failure.
- `EdgeLayer` props `broadphase` and `minPickDistance` are declared but read nowhere.
  `edge-layer-smoothing.fs` is empty and unused.
- `CircleLayer` radius uses only `cameraScale2D.x`, so circles stay round (and track the x
  zoom) under anisotropic zoom. `RingLayer` radius ignores zoom entirely.
- `ImageInstance.onError` is declared but never assigned from options nor called.
  `ImageInstance` sets `width`/`height` to 1 when not given; set them (or `maxSize`) explicitly.
- `ImageRenderLayer` used alone warns and renders nothing useful: it expects
  `instance.request` to be set by `ImageLayer`. Use `ImageLayer`.
- Anchors are computed from the size at `setAnchor` time; after changing `size`/`width`, call
  `setAnchor` again.
- Several shaders (rectangle, ring, rotation image) use GLSL ES 3 float literals (`1.0f`).
- `VertexPointsLayer` is not exported by `ui/src/2d/layers/index.ts`; import it by path
  (`ui/src/2d/layers/vertex-points/vertex-points-layer.ts`, as
  `ui/stories/components/float-textures.stories.tsx` does). It adds a dummy instance to the
  provider each time `initShader()` runs.

## Related

- [Labels](labels.md) — label, glyph and text-area layers.
- [2D view and camera](view-and-camera.md) — `Layer2D`, `clipSpace`, camera uniforms.
- [Authoring a layer](../shaders/authoring-a-layer.md) — how `initShader` and attributes work.
- [Instances](../instances/instances.md) — `Instance`, `@observable`, `makeObservable`.
- [Easing and animation](../instances/easing-and-animation.md) — the `animate` props.
- [Textures and atlases](../resources/textures-and-atlases.md) — atlas requests used by images.
