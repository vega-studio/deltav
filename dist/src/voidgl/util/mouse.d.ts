import { Vector2 } from "three";
declare let normalizeWheel: (e: MouseWheelEvent) => Vector2;
declare function eventElementPosition(e: any, relative?: HTMLElement): {
    x: number;
    y: number;
};
export { eventElementPosition, normalizeWheel };
