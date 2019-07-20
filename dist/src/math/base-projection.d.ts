import { Bounds } from "./primitives/bounds";
import { Vec2, Vec2Compat } from "./vector";
export declare abstract class BaseProjection<T> {
    readonly uid: number;
    private _uid;
    id: string;
    pixelRatio: number;
    screenBounds: Bounds<T>;
    viewBounds: Bounds<T>;
    screenToRenderSpace(point: Vec2, out?: Vec2): [number, number];
    renderSpaceToScreen(point: Vec2, out?: Vec2): [number, number];
    screenToView(point: Vec2, out?: Vec2): [number, number];
    viewToScreen(point: Vec2, out?: Vec2): [number, number];
    abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}
export declare class SimpleProjection extends BaseProjection<any> {
    screenToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    worldToScreen(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    viewToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    worldToView(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
}
