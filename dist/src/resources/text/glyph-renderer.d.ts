/**
 * This provides the methods needed to render single glyphs and receive the image data
 * for the rendering. The glyphs will be rendered within a given dimension range and centered.
 */
/**
 * Renders a glyph centered within the provided rectangle size. This also provides the size of the
 * rendered glyph along with a vector pointing to the topleft of the glyph within then rectangle.
 * This vector can be used to find any corner of the glyph as the glyph is centered within the
 * rectangle's space.
 */
export declare function renderGlyph(glyph: string, width: number, height: number, font: string): {
    data: ImageData;
    size: number[];
} | null;
