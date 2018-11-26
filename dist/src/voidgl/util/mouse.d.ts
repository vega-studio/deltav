import { Vec2 } from "./vector";
declare let normalizeWheel: (e: MouseWheelEvent) => Vec2;
declare function eventElementPosition(e: any, relative?: HTMLElement): Vec2;
export { eventElementPosition, normalizeWheel };
