import type { IFontMapMetrics } from "./font-manager";
/**
 * This takes a very simple svg and converts it to a data object for pixel
 * examination.
 *
 * Note: if a font is NOT a system font, it needs to be embedded into the svg.
 * To have this method perform this for you use the svgNS AND embed arguments to
 * enable automatic embedding of the font.
 */
export declare function svgToData(svg: SVGSVGElement, svgNS?: string, embed?: IFontMapMetrics["embed"]): Promise<ImageData | null>;
