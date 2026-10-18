---
title: Text and fonts
summary: Font resources: FontMap textures filled on demand with canvas-rendered glyphs, kerning estimated from rendered letter pairs, string layout and truncation for label layers.
covers:
  - ui/src/resources/text
related:
  - resources/resource-management.md
  - resources/textures-and-atlases.md
  - 2d/labels.md
status: complete
verified-at: 8c3a0ef6
---

## Purpose

A font resource (`ResourceType.FONT`) is a `FontMap`: one GPU texture into which glyphs of a CSS
font are rasterised as they are needed, plus the kerning table and per-glyph metrics required to lay
out a single line of text. The label layers (`LabelLayer`, `GlyphLayer`, `TextAreaLayer`) request
glyph UVs, glyph sizes and string layouts from it. Everything is measured from the browser's own
text rendering (2D canvas and SVG), so any font the page can display — including embedded web
fonts — works without font files being parsed.

## Key files

- `ui/src/resources/text/font-manager.ts` — `createFont`, `IFontResourceOptions`, `FontMapSource` and its variants, `IFontMapEmbed`, `FontGlyphRenderSize`, `isFontResource`, `FontManager` (creates and fills font maps, computes metrics).
- `ui/src/resources/text/font-resource-manager.ts` — `FontResourceManager` (request queue, instance (de)activation, `TextureIOExpansion` for FONT).
- `ui/src/resources/text/font-resource-request.ts` — `IFontResourceRequest`, `fontRequest`, `FontResourceRequestFetch`, `preloadNumber`.
- `ui/src/resources/text/font-map.ts` — `FontMap`, `FontMapGlyphType`, `KernedLayout`; `getStringLayout`, `getTruncatedLayout`, `getStringWidth`, `getGlyphTexture`, `getGlyphKerning`, `supportsKerning`.
- `ui/src/resources/text/font-renderer.ts` — `FontRenderer.makeBitmapGlyphs`, `FontRenderer.estimateKerning`, `KerningPairs`.
- `ui/src/resources/text/glyph-renderer.ts` — `renderGlyph`: draws one character on a 2D canvas and crops it to its ink bounds.
- `ui/src/resources/text/svg-to-data.ts` — `svgToData`: rasterises an SVG (with optional `@font-face` embedding) to `ImageData`.
- `ui/src/resources/text/load-fonts.ts` — `loadFonts`: loads `IFontMapEmbed` sources through the `FontFace` API.
- `ui/src/resources/text/cpu-sdf.ts` — `convertToSDF` (jump-flooding distance field on a canvas), `makeFontSDF` (empty TODO).

## How it works

### Declaring a font

```ts
createFont({
  key: "font",
  dynamic: true,
  fontSource: { family: "Arial", size: 32, weight: 400, preload: "0123456789" },
  // characterFilter?: "abc...", fontMapSize?: [2048, 2048]
});
```

`FontResourceManager.initResource` → `FontManager.createFontMap`:

1. Glyph type: a `fontSource` without `type` → `FontMapGlyphType.BITMAP`; otherwise its `type`.
   The type only selects texture settings (`FontMap.makeGlyphTypeTextureSettings`): BITMAP →
   LuminanceAlpha with `LinearMipMapLinear` min filter, SDF → Luminance, MSDF → RGB.
2. `new FontMap(...)`: a blank `Texture` of `fontMapSize` (default 1024×1024, mipmaps and
   premultiplied alpha on), a `PackNode` over it, and cached kerning from `localStorage` when
   `fontSource.localKerningCache` is set (key `__deltav_kerning_cache_<family>__`).
3. Glyphs for the deduplicated `characterFilter` are rendered and packed.
4. If `fontSource.preload` is set, an `updateFontMap` with that string's characters and kerning
   pairs is started (not awaited).

### Requests

`fontRequest({ key, character?, kerningPairs?, metrics?, fetch? })`. `FontResourceManager.request`:

- If `request.fontMap` is already populated: with `character`, returns
  `subTextureIOValue(fontMap.getGlyphTexture(char))` (UVs) or, when
  `fetch === FontResourceRequestFetch.IMAGE_SIZE`, `[pixelWidth, pixelHeight]`; zeros if the glyph is
  missing.
- Otherwise the request is queued per font key (deduplicated by request object), the instance is
  deactivated and zeros are returned.

`dequeueRequests`, per font key:

1. `FontManager.updateFontMap` collects every requested `character`, every `kerningPairs` string and
   `metrics.truncation`; awaits `loadFonts(fontMap.fontString, fontSource.embed)`; renders and packs
   missing glyphs; estimates missing kerning pairs; then sets `request.fontMap` on every request.
2. `FontManager.calculateMetrics` fills `metrics.layout = fontMap.getStringLayout(text, fontSize,
   letterSpacing)` and, with `metrics.maxWidth`, replaces it with `getTruncatedLayout(...)` and sets
   `metrics.truncatedText`.
3. Waiting instances still managed by their layer are re-activated; `resourceTrigger()` runs on the
   next frame.

`LabelLayer` sends one request per label with `kerningPairs: [text]` and `metrics`, then creates one
`GlyphInstance` per glyph from `metrics.layout`; `GlyphLayer` caches one request per character
(`glyphRequests`) and uses it for both the `texture` attribute (TEXCOORDS) and the child `glyphSize`
attribute (IMAGE_SIZE). See [Labels](../2d/labels.md).

### Glyph rasterisation

`FontRenderer.makeBitmapGlyphs` calls `renderGlyph(char, size * 2, size * 2, fontString)` for each
character: white `fillText` centred on a shared canvas, then the ink bounding box (+1 px margin
left/top, +2 right/bottom) is cropped to `ImageData`. `FontManager.updateFontMapCharacters` packs
each image into `fontMap.packing`, writes UVs with `PackNode.applyToSubTexture(..., flipY = true)`,
uploads with `texture.update(glyph, region)` and calls `FontMap.registerGlyph`. Glyph images carry
no baseline: vertical placement comes from kerning.

### Kerning estimation

`FontRenderer.estimateKerning(strings, ...)` splits each string (whitespace removed) into adjacent
pairs not yet in `fontMap.kerning`. `renderEachPair` lays the pairs out in an SVG grid, left glyph
red and right glyph blue, rasterises it with `svgToData` (embedding `@font-face` rules for `embed`
fonts; batched so each image stays under `WebGLStat.MAX_TEXTURE_SIZE`), and stores the vector from
the red ink's top-left to the blue ink's top-left as `kerning[left][right]` (divided by
`devicePixelRatio`). When the map has no `spaceWidth`, an extra "M M" cell measures the width of a
space. `FontMap.addKerning` merges pairs and refreshes the local cache.

### Layout

`FontMap.getStringLayout(text, fontSize, letterSpacing)` produces a `KernedLayout`: `fontScale =
fontSize / fontSource.size`; for each non-whitespace character the offset advances by the scaled
kerning vector from the previous glyph, plus `spaceWidth * fontScale` per preceding whitespace
character, plus `letterSpacing`. `positions` are glyph top-left corners, shifted so the minimum Y is
0; `size` is the total width and height; `glyphs` is the text without whitespace. Single line only.
`getTruncatedLayout` binary-searches the last glyph that fits with the truncation string, estimates
any missing kerning for the join, and re-lays out the truncated text.

## Extension points

- Font source options: `size` (render size on the map, the quality knob — `FontGlyphRenderSize`
  lists sensible values), `family`, `weight`, `embed` (base64 or URL font faces), `preload`,
  `localKerningCache`.
- `characterFilter` + `dynamic` control which glyphs exist; `fontMapSize` raises capacity.
- `preloadNumber()` returns a preload string covering digit pairs and common numeric punctuation.
- `convertToSDF(canvas, mapMethod?)` is a standalone exported utility; plug a custom
  `mapMethod(seed, inverseSeed, noData, outData)` to map the jump-flood result differently.
- A different font strategy is a replacement manager for `ResourceType.FONT` (see
  [Resource management](resource-management.md)); it must populate `request.fontMap` and
  `metrics.layout` the way label layers expect.

## Gotchas

- **Set `dynamic: true`.** `FontMap.registerGlyph` refuses every glyph (warning) when `dynamic` is
  false, and `FontManager` never passes `characters` to the `FontMap` constructor, so a non-dynamic
  font map ends up with no glyphs — even for `characterFilter`. The label story uses `dynamic={true}`.
- SDF/MSDF are not implemented in the pipeline: glyphs are always canvas bitmaps;
  `convertToSDF` is not called, `makeFontSDF` and `FontManager.getPrerenderedImageData` are unused
  TODOs. A `type: SDF/MSDF` source only changes the texture format.
- `FontMap.fontString` is `` `${size}px ${family}` `` — `weight` is not part of it, so glyphs render
  at the family's default weight unless the family name itself selects a weight.
- The kerning SVG sets `style.fontFamily = "RedHatDisplay"` after `style.font = fontString`, so pair
  measurements use that family (or the browser fallback) rather than `fontSource.family`.
- `characterFilter` glyphs are rendered in `createFontMap` before `loadFonts` has run; with an
  `embed` font they may be drawn with a fallback font. Prefer `preload` (processed through
  `updateFontMap`, which loads fonts first).
- `getStringLayout` assumes every glyph and every adjacent pair is already in the map (it
  dereferences `glyphMap[char]` and `kerning[left]` directly) — request `kerningPairs: [text]` first.
- A full map only warns (`Font map is full ...`) and stops adding glyphs; there is no repacking.
  Increase `fontMapSize` or reduce `size`.
- `updateResource` does nothing; recreate the font under a new key to change it.
- Everything here needs a DOM (`document`, canvas, `FontFace`, `XMLSerializer`); glyph and kerning
  measurement is synchronous CPU work and is the main cost of first-time label rendering.

## Related

- [Resource management](resource-management.md) — router, request/dequeue cycle, `resourceTrigger`.
- [Textures and atlases](textures-and-atlases.md) — `PackNode`, `SubTexture`, `TextureIOExpansion`.
- [Labels](../2d/labels.md) — `LabelLayer`, `GlyphLayer`, `TextAreaLayer`, the consumers.
