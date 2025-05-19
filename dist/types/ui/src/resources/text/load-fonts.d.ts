import type { IFontMapMetrics } from "./font-manager.js";
/**
 * This ensures the fonts being embedded have been loaded completely before
 * continuing operation.
 */
export declare function loadFonts(fontString: string, embed?: IFontMapMetrics["embed"]): Promise<void>;
