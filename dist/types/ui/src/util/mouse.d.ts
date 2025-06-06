import { normalizeWheel } from "../../../util/normalize-wheel/index.js";
import { Vec2 } from "../math/vector.js";
/**
 * Analyzes a MouseEvent and calculates the mouse coordinates (relative to the element).
 */
declare function eventElementPosition(e: any, relative?: HTMLElement): Vec2;
export { eventElementPosition, normalizeWheel };
