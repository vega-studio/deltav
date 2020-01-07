import { Bounds } from "./primitives/bounds";
import { Vec2, Vec2Compat } from "./vector";
/**
 * This object expresses a suite of methods that aids in projecting values from screen to world and vice versa.
 * These methods can be implemented in many ways and should be customized to a view + camera configuration.
 */
export declare abstract class BaseProjection<T> {
    /** Provides a numerical UID for this object */
    readonly uid: number;
    private _uid;
    /** Allows for a sensical identifier to be applied to this projection. */
    id: string;
    /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
    pixelRatio: number;
    /** This is the rendering bounds within screen space */
    screenBounds: Bounds<T>;
    /**
     * The bounds of the render space on the canvas this view will render on. This is the size of the render space within
     * the context so this will include the pixelRatio as needed.
     */
    viewBounds: Bounds<T>;
    /**
     * This projects a point to be relative to the rendering dimensions of the view.
     */
    screenToRenderSpace(point: Vec2, out?: Vec2): [number, number];
    /**
     * This projects a point relative to the render space of the view to the screen coordinates
     */
    renderSpaceToScreen(point: Vec2, out?: Vec2): [number, number];
    /**
     * Takes a coordinate in screen coordinates and maps it to a point that is relative to a view's viewport on
     * the screen.
     */
    screenToView(point: Vec2, out?: Vec2): [number, number];
    /**
     * Takes a coordinate that is relative to a view's viewport within the screen and maps it to a coordinate relative to
     * the screen.
     */
    viewToScreen(point: Vec2, out?: Vec2): [number, number];
    /**
     * Maps a coordinate relative to the screen to a coordinate found within the world space.
     */
    abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the screen space.
     */
    abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
     */
    abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
     */
    abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}
/**
 * This is an implementation of the BaseProjection with the abstract methods implmented but not functional
 */
export declare class SimpleProjection extends BaseProjection<any> {
    screenToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    worldToScreen(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    viewToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
    worldToView(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat;
}
