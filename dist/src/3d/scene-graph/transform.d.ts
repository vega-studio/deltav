import { Mat4x4, Quaternion, Vec3 } from "../../math";
import { Instance3D } from "./instance-3d";
import { TreeNode } from "./tree-node";
/**
 * The initial properties of the transform on creation
 */
export interface ITransform {
    /** Starting position in local space */
    localPosition?: Vec3;
    /** Starting rotation in local space */
    localRotation?: Quaternion;
    /** Starting scale in local space */
    localScale?: Vec3;
    /** A parent transform relative to this transform */
    parent?: Transform;
}
/**
 * This is a wrapper for a 3D matrix for transforming coordinates from one
 * vector space to another. Follows the order of ISROT: Identity, Scale,
 * Rotation, Origin, Translation. However, this only provides the SRT properties
 * for simpler affine transforms.
 *
 * This class also helps manage a balance between local and world information
 * needed for the transform.
 *
 * This operates with less information and less calculations when only the local
 * orientations are used (or no parent is set).
 */
export declare class Transform extends TreeNode<Transform> {
    /** Indicates this transform is queued for an update in the update loop */
    private isQueuedForUpdate;
    /**
     * Helper flag indicating it is relevant to have the world orientation
     * decomposed from the world transform.
     */
    private needsWorldOrientation;
    /**
     * Flag indicates the world matrix has been updated but has not been through
     * a decomposition yet.
     */
    private needsWorldDecomposition;
    /**
     * Flag that indicates this transform has a matrix that performs the
     * operations in reverse (such as for a camera.)
     */
    private hasViewMatrix;
    /** This is a special instance listener for the transform */
    private _instance;
    set instance(val: Instance3D | null);
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
    private _matrix;
    /**
     * This is the local matrix which represents the transform this Transform
     * performs which does NOT include the parent transforms to this transform.
     */
    get localMatrix(): Mat4x4;
    private _localMatrix;
    /**
     * This is the transform matrix that contains the operations in reverse order.
     * This produces a 'view matrix' for the transform and shouldn't be considered
     * an inverse matrix. This is commonly used for Camera constructs whos
     * orientation is reverse to the world (the camera would exist in world space
     * using the normal world matrix, but the operations to transform everything
     * to the cameras perspective is in the exact opposite order.)
     *
     * Currently, the viewMatrix does NOT consider parenting.
     */
    get viewMatrix(): Mat4x4;
    private _viewMatrix?;
    /**
     * Orientation of this transform in world space. When no parent is present
     * rotation === localRotation.
     */
    get rotation(): Quaternion;
    set rotation(val: Quaternion);
    /**
     * Orientation of this transform without it's parent's orientation. When no
     * parent is present rotation === localRotation.
     */
    get localRotation(): Quaternion;
    set localRotation(val: Quaternion);
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
    get localScale(): Vec3;
    set localScale(val: Vec3);
    private _scale;
    private _localScale;
    /**
     * Translation of this transform in world space. When there is no parent,
     * position === localPosition.
     */
    get position(): Vec3;
    set position(val: Vec3);
    /**
     * The position this transform applies ignoring the parent Transform. When
     * there is no parent, position === localPosition.
     */
    get localPosition(): Vec3;
    set localPosition(val: Vec3);
    private _position;
    private _localPosition;
    /**
     * The forward vector for this particular transform in world space. When no
     * parent is present, forward === localForward.
     */
    get forward(): Vec3;
    /**
     * The forward vector for this particular transform ignoring the parent
     * transform. When no parent is present, forward === localForward.
     */
    get localForward(): Vec3;
    private _forward;
    private _localForward;
    private needsForwardUpdate;
    constructor(options?: ITransform);
    /**
     * Adjusts the transform's properties all at once to shave off a little bit of
     * overhead.
     */
    applyLocalSRT(scale: Vec3, rotation: Quaternion, translation: Vec3): void;
    /**
     * This method contains the math involved in decomposing our world SRT matrix
     * so we can view the Transform's orientation relative to world space.
     */
    private decomposeWorldMatrix;
    /**
     * Orients this transform to make the forward direction point toward a
     * position relative to this transform. When no parent is present, lookAt and
     * lookAtLocal behaves exactly the same.
     */
    lookAtLocal(position: Vec3, up?: Vec3): void;
    /**
     * Changes the parent transform of this Transform. This triggers required
     * updates for this Transform.
     */
    setParent(v?: Transform, unsafe?: boolean): void;
    /**
     * We override the invalidation to aid in handling the issue with our
     * rendering system being "passive" and our node structure to be "passive" as
     * well.
     */
    invalidate(): boolean;
    /**
     * This is an ambiguous but simple method that attempts to re-optimize this
     * transform. If you have maybe a one time analysis of properties over the
     * course of a lengthy period of time, consider calling this.
     *
     * Instances and transforms take the approach of "shifting gears" toward world
     * decomposition after world orientations are queried. However, you may not
     * always need or rarely need a specific world orientation. Thus calling this
     * method will make the instance and transform assume it no longer needs world
     * orientations once again until something queries for it.
     */
    optimize(): void;
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
export declare const IdentityTransform: Readonly<Transform>;
