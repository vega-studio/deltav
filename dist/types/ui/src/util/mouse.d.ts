import { normalizeWheel } from "../../../util/normalize-wheel";
import { Vec2 } from "../math/vector";
/**
 * Analyzes a MouseEvent and calculates the mouse coordinates (relative to the element).
 */
declare function eventElementPosition(e: any, relative?: HTMLElement): Vec2;
export { eventElementPosition, normalizeWheel };
