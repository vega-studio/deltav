import { Mat4x4, Quaternion, Vec2Compat, Vec3 } from "../../math";
import { Instance2D } from "./instance-2d.js";
import { TreeNode } from "./tree-node.js";
/**
 * This is a transform node that specifically only operates on x y positions and
 * single value rotations. It still is compatible with the 3D node system but
 * significantly reduces operations when only 2D operations are needed.
 */
export declare class Transform2D extends TreeNode<Transform2D> {
    /** Indicates this transform is queued for an update in the update loop */
    private isQueuedForUpdate;
    /**
     * Helper flag indicating it is relevant to have the world orientation
     * decomposed from the world transform.
     */
    private needsWorldOrientation;
    /**
     * When this is set, this means the world matrix has updated and has not been
     * decomposed yet.
     */
    private needsWorldDecomposition;
    /** This is a special instance listener for the transform */
    private _instance;
    set instance(val: Instance2D | null);
    /**
     * This is the inner matrix that represents the culmination of all the
     * properties into a single transform matrix. It is invalid and will cause
     * undefined behavior if the elements of this matrix are modified. You should
     * use the provided methods of this Transform class to manipulate this matrix.
     *
     * This matrix is what is used to transform coordinates into world space, thus
     * it is also the culmination of all the parent's to this particular
     * transform.
     */
    get matrix(): Mat4x4;
    /**
     * This is the culminated matrix for world space which includes this
     * Transform's changes plus it's parent's changes.
     */
    private _matrix;
    /**
     * This is the local matrix which represents the transform this Transform
     * performs which does NOT include the parent transforms to this transform.
     */
    private _localMatrix;
    /**
     * Translation of this transform in world space.
     */
    get position(): Vec3;
    set position(val: Vec3);
    /**
     * The position on the x y axis
     */
    get localPosition(): Vec2Compat;
    set localPosition(val: Vec2Compat);
    private _position;
    private _localPosition;
    /**
     * Orientation of this transform in world space. When no parent is present
     * rotation === localRotation.
     */
    get rotation(): Quaternion;
    set rotation(_val: Quaternion);
    /**
     * Orientation of this transform without it's parent's orientation. When no
     * parent is present rotation === localRotation.
     */
    get localRotation(): number;
    set localRotation(val: number);
    private _rotation;
    private _localRotation;
    private localRotationMatrix;
    /**
     * The scale of the Transform in world space. When there is no parent,
     * localScale === scale.
     */
    get scale(): Vec3;
    set scale(val: Vec3);
    /**
     * The scale this Transform applies ignoring the parent Transform. When there
     * is no parent, localScale === scale.
     */
    get localScale(): Vec2Compat;
    set localScale(val: Vec2Compat);
    private _scale;
    private _localScale;
    /**
     * This method contains the math involved in decomposing our world SRT matrix
     * so we can view the Transform's orientation relative to world space.
     */
    private decomposeWorldMatrix;
    /**
     * Ensures this transform WILL receive an update if it fits requirements for
     * potentially missing an update that may be needed by passive elements.
     */
    queueForUpdate(): void;
    /**
     * If needed, this updates the matrix for this transform. This is called
     * automatically when the matrix is retrieved.
     *
     * The unsafe flag causes this node to update without ensuring it's parents
     * are out of date. Recommended to not use this flag ever. The system handles
     * all of that for you.
     */
    update(unsafe?: boolean): void;
}
