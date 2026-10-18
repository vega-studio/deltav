---
title: Surface commands
summary: SurfaceCommands and CommandLayer: running imperative callbacks, such as picking decode, at a chosen point of the render pipeline.
covers:
  - ui/src/surface/surface-commands.ts
  - ui/src/surface/command-layer.ts
related:
  - surface/surface.md
  - surface/layer.md
  - surface/render-loop.md
  - interaction/picking.md
status: complete
verified-at: 6d7b2744
---

## Purpose

Some GPU work must happen at a precise point between view renders and may block on the GPU —
reading back pixels of a picking texture is the main case. `SurfaceCommands` (available as
`Surface.commands`) holds such operations; `CommandLayer` is a layer that renders nothing and
instead runs a callback with the `Surface` when the render loop reaches it, so commands can be
placed in the pipeline by scene and view order.

## Key files

- `ui/src/surface/surface-commands.ts` — `SurfaceCommands`, `ISurfaceCommandsOptions`.
- `ui/src/surface/command-layer.ts` — `CommandLayer`, `ICommandLayerProps`, `CommandCallback`.
- `ui/src/base-surfaces/react-surface/processing/commands-jsx.tsx` — `CommandsJSX`, a scene with a
  `View2D` and a `CommandLayer` for React pipelines.
- `ui/src/surface/event-managers/layer-mouse-events.ts` — `LayerMouseEvents`, which requests the
  picking output and dispatches the layer pick events.
- `ui/src/surface/layer-interaction-handler.ts` — `LayerInteractionHandler`, holder of
  `colorPicking` per layer.

## How it works

### CommandLayer

`CommandLayer.initShader()` returns `null`, so the layer is a shell layer: no shader, no buffers,
picking forced to `NONE`. `CommandLayer.draw()` (called by `Surface.commit` for each drawn view of
its scene, see [Render loop](render-loop.md)) calls `props.commands(surface)`. Its
`defaultProps` provide an empty `InstanceProvider`, so only `key` and `commands` are needed:

```ts
{
  key: "decode-picking",
  views: [createView(View2D, { camera: new Camera2D() })],
  layers: [createLayer(CommandLayer, { commands: (s) => s.commands.decodePicking() })],
}
```

In React, `CommandsJSX({ name, callback })` builds the same scene.

### SurfaceCommands.decodePicking

The only built-in command. It reads the color-picking output for the latest user interaction
and hands the result to the layers. It is a **blocking** GPU read (`readPixels`), so the source
recommends running it at the start of the pipeline, when the previous frame's GPU work is done.

1. `surface.getCurrentInteraction()`; no interaction → return.
2. Drop cached picking targets whose texture lost its GL handle or was destroyed.
3. For each view under the interaction (`interaction.target.views`), find or create a
   one-buffer `RenderTarget` wrapping the view render target's buffer whose `outputType` is
   `FragmentOutputType.PICKING` (warns once if that texture has `generateMipMaps`). Cached in
   `pickingRenderTargets` per view.
4. Switch the renderer to that target if needed, then `analyzePickedPixels`:
   - Skips views with `optimizeRendering` set.
   - Maps the mouse position by `surface.pixelRatio` and `view.projection.screenScale`, reads a
     5×5 pixel block around it, and builds `IColorPickingData`: all unique colors, and the
     non-black color nearest to the centre (`nearestColor`, `nearestColorBytes`).
   - Assigns that data to `layer.interactions.colorPicking` for every `PickType.SINGLE` layer
     in the view's scene.

The colors are instance uids encoded by the picking shader module; `LayerInteractionHandler`
maps them back to instances through `layer.uidToInstance`, and `LayerMouseEvents` fires the
layer's `onMouse*` / `onTouch*` callbacks. `LayerMouseEvents.willRender` deletes
`colorPicking` at the start of every frame, so the data only lives for the frame that decoded it. The pick pass
itself is rendered only on frames where `Surface.enableOptimizedOutput(PICKING)` was called, if
`PICKING` is in `optimizedOutputTargets`. Full flow: [Picking](../interaction/picking.md).

## Extension points

- Any imperative step in the frame: a `CommandLayer` with a custom `commands(surface)`; it can
  use `surface.renderer` and raw GL (`surface.gl`). Placement is controlled by the scene's
  `order` and the views' order/draw mode.
- New reusable commands: add methods to `SurfaceCommands` (it holds `surface` and per-view
  caches).
- Subclass `CommandLayer` to add props; keep `initShader()` returning `null`.

## Gotchas

- The callback runs once per drawn view of its scene; give the command scene exactly one view.
  A view that fails `shouldDrawView` skips the command for that frame.
- The callback runs inside `Surface.commit` (before that view's scene is rendered), during the
  update phase: GL state (render target, viewport) is whatever the previous view left.
- `decodePicking` needs a view whose `output.buffers` has a `FragmentOutputType.PICKING` texture,
  layers with `picking: PickType.SINGLE`, and a compiled render target (`renderTarget.gl`); a
  zero-size target is skipped until it has a size.
- Mipmapped picking textures blend neighbouring colors and break picking accuracy.
- `readPixels` stalls the CPU until the GPU finishes; running the command after heavy views
  costs a full pipeline flush.

## Related

- [Picking](../interaction/picking.md) — color picking end to end.
- [Render loop](render-loop.md) — where layer `draw()` runs in a frame.
- [Layer](layer.md) — shell layers (`initShader` returning `null`).
- [Surface](surface.md) — `Surface.commands`, optimized outputs.
