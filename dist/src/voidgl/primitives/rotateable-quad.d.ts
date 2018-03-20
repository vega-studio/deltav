import { Vector4 } from 'three';
import { Bounds } from './bounds';
import { IPoint } from './point';
import { ISize } from './size';
export declare enum AnchorPosition {
    BottomLeft = 0,
    BottomRight = 1,
    Custom = 2,
    Middle = 3,
    MiddleBottom = 4,
    MiddleLeft = 5,
    MiddleRight = 6,
    MiddleTop = 7,
    TopLeft = 8,
    TopRight = 9,
}
export declare class RotateableQuad<T> extends Bounds<T> {
    BL: Vector4;
    BR: Vector4;
    TL: Vector4;
    TR: Vector4;
    /** This is the anchor point where location and rotation is based on */
    private anchor;
    /** This auto sets where the anchor point should be located */
    private anchorType;
    /** This will contain all of the results of the transform after the metrics have been applied to the vertices */
    private base;
    /** This sets the location of the quad with it's anchor point set to this spot in world coordinates */
    private location;
    /** Specifies rotation, in radians, around the anchor */
    private rotation;
    /** Specifies how wide and high the quad is */
    private size;
    /** This contains the transform */
    private transform;
    /** This determines if any metric has changed. If so, then the update must recalculate */
    private isDirty;
    /**
     * Generates a quad
     *
     * @param {IPoint} location The location of the quad (it's anchorpoint will be placed here)
     * @param {number} width The width of the quad
     * @param {number} height The height of the quad
     * @param {AnchorPosition} anchor The anchor location of the quad.
     *                                Location and rotation will be relative to this.
     */
    constructor(location: IPoint, size: ISize, rotation: number, anchor?: AnchorPosition);
    /**
     * @private
     * Recalculates this anchor position based on the anchor type
     *
     * @param {AnchorPosition} anchor
     */
    private calculateAnchor(anchor);
    /**
     * Get the base size of the quad
     *
     * @returns {ISize} The base size of this quad
     */
    getSize(): ISize;
    /**
     * Sets the specified anchor position on the quad
     *
     * @param {AnchorPosition} anchor This specifies an auto calculated position for the anchor
     * @param {IPoint} custom If specified, will set a custom anchor location rather
     *                        than the calculated version.
     */
    setAnchor(anchor?: AnchorPosition, custom?: IPoint): void;
    /**
     * Retrieves the position of the anchor
     *
     * @param worldSpace If this is true, this will calculate the anchor's position relative to world
     *                   coordinates.
     */
    getAnchor(worldSpace?: boolean): IPoint;
    getAnchorType(): AnchorPosition;
    /**
     * This sets the location of this quad to a given position where the anchor
     * point will be located on top of the location provided.
     *
     * @param {IPoint} location The location to place the quad
     */
    setLocation(location: IPoint): void;
    getLocation(): IPoint;
    /**
     * Sets the rotation of this quad, in radians, rotated around the anchor point.
     *
     * @param {number} rotation The rotation of the quad
     */
    setRotation(rotation: number): void;
    /**
     * get Rotation
     */
    getRotation(): number;
    /**
     * get direction as a point
     */
    getDirection(): {
        x: number;
        y: number;
    };
    /**
     * Applies the size to the base
     *
     * @param {ISize} size The size of the base quad
     */
    setSize(size: ISize): void;
    /**
     * This re-calculates the transform for this quad and applies the transform to
     * the corners.
     */
    update(): void;
}
