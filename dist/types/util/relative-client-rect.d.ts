import { DOMRectBounds, DOMRectPadding } from "./clone-client-rect.js";
/**
 * Calculates a ClientRect that is relative to another client rect.
 */
export declare function relativeClientRect(source?: DOMRectBounds, relativeTo?: DOMRectBounds, padding?: DOMRectPadding): DOMRectBounds;
