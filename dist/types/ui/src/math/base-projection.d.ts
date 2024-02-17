import { Vec2, Vec2Compat } from "./vector";
import { Bounds } from "./primitives/bounds";
import { Ray } from "./ray";
/**
 * This object expresses a suite of methods that aids in projecting values from
 * screen to world and vice versa. These methods can be implemented in many ways
 * and should be customized to a view + camera configuration.
 */
export declare abstract class BaseProjection<T> {
    /** Provides a numerical UID for this object */
    get uid(): number;
    private _uid;
    /** Allows for a sensical identifier to be applied to this projection. */
    id: string;
    /**
     * This is set to ensure the projections that happen properly translates the
     * pixel ratio to normal Web coordinates
     */
    pixelRatio: number;
    /** This is the rendering bounds within screen space */
    get screenBounds(): Bounds<T>;
    set screenBounds(val: Bounds<T>);
    /**
     * This helps resolve view's that don't correlate to the screen perfectly.
     * This would include times a view renders to a resource at a scaled valued
     * compared to the actual dimensions of the screen.
     */
    get screenScale(): Vec2;
    set screenScale(val: Vec2);
    /**
     * The bounds of the render space on the canvas this view will render on. This
     * is the size of the render space within the context so this will include the
     * pixelRatio as needed.
     */
    viewBounds: Bounds<T>;
    private _screenScale;
    private _screenBounds;
    private _scaledScreenBounds?;
    /**
     * This projects a point to be relative to the rendering dimensions of the
     * view.
     */
    screenToRenderSpace(point: Vec2, out?: Vec2): Vec2;
    /**
     * This projects a point relative to the render space of the view to the
     * screen coordinates
     */
    renderSpaceToScreen(point: Vec2, out?: Vec2): Vec2;
    /**
     * Takes a coordinate in screen coordinates and maps it to a point that is
     * relative to a view's viewport on the screen.
     */
    screenToView(point: Vec2, out?: Vec2): Vec2;
    /**
     * Takes a coordinate that is relative to a view's viewport within the screen
     * and maps it to a coordinate relative to the screen.
     */
    viewToScreen(point: Vec2, out?: Vec2): Vec2;
    /**
     * Maps a coordinate relative to the screen to a coordinate found within the
     * world space.
     */
    abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate relative to the screen to a ray that emanates from the
     * selected coordinate such that the ray extending to infinity would be
     * projected to the same point.
     */
    abstract screenRay(point: Vec2Compat): Ray;
    /**
     * Maps a coordinate found within the world to a relative coordinate within
     * the screen space.
     */
    abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate relative to the view's viewport to a coordinate found
     * within the world.
     */
    abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate found within the world to a relative coordinate within
     * the view's viewport.
     */
    abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}
/**
 * This is an implementation of the BaseProjection with the abstract methods
 * implmented but not functional
 */
export declare class SimpleProjection extends BaseProjection<any> {
    screenToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    screenRay(_point: Vec2Compat): Ray;
    worldToScreen(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    viewToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    worldToView(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
}
