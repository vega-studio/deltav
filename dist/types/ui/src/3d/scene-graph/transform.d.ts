import { Mat4x4, Quaternion, Vec3 } from "../../math";
import { Instance3D } from "./instance-3d.js";
import { TreeNode } from "./tree-node.js";
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
     */
    get viewMatrix(): Mat4x4;
    private _viewMatrix?;
    /**
     * Returns the computed inverse of the view matrix.
     * WARN: If the view matrix is incapable of being inverted, the identity matrix
     * will be returned.
     */
    get inverseViewMatrix(): Mat4x4;
    private _invserseViewMatrix?;
    /**
     * This excludes any parent transform information and is the view matrix
     * specific to this transform.
     *
     * This is the transform matrix that contains the operations in reverse order.
     * This produces a 'view matrix' for the transform and shouldn't be considered
     * an inverse matrix. This is commonly used for Camera constructs whos
     * orientation is reverse to the world (the camera would exist in world space
     * using the normal world matrix, but the operations to transform everything
     * to the cameras perspective is in the exact opposite order.)
     */
    get localViewMatrix(): Mat4x4;
    private _localViewMatrix?;
    /**
     * Transforms can have an additional modification for non-affine or
     * specialized transforms that are generally considered too expensive to keep
     * track of at all times.
     *
     * This is NOT applied to the viewMatrix output. Use localViewTransform for
     * that.
     *
     * Applying this matrix to this Transform will make 'world space' values
     * invalid.
     *
     * Why do world calculations stop working? Since this transform is so generic
     * there is no good way to derive that information anymore.
     */
    get localTransform(): Mat4x4 | undefined;
    set localTransform(val: Mat4x4 | undefined);
    private _localTransform?;
    /**
     * This is the same as localTransform except it is ONLY applied to the view.
     * We have a transform for the view and the node separated as there are more
     * cases to have specialized view calculations, but require having the node be
     * left unaffected. Such as having elements follow the Camera, but have the
     * camera distort the final output space.
     *
     * Transforms can have an additional modification for non-affine or
     * specialized transforms that are generally considered too expensive to keep
     * track of at all times.
     *
     * Applying this matrix to this Transform will make 'world space' values
     * invalid.
     *
     * Why do world calculations stop working? Since this transform is so generic
     * there is no good way to derive that information anymore.
     */
    get localViewTransform(): Mat4x4 | undefined;
    set localViewTransform(val: Mat4x4 | undefined);
    private _localViewTransform?;
    /**
     * Orientation of this transform in world space. When no parent is present
     * rotation === localRotation.
     *
     * If localTransform is present, this value may be incorrect.
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
     *
     * If localTransform is present, this value may be incorrect.
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
     *
     * If localTransform is present, this value may be incorrect.
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
     * Set the local position. Supports chaining.
     */
    setLocalPosition(position: Vec3): this;
    /**
     * Set the local rotation. Supports chaining.
     */
    setLocalRotation(rotation: Quaternion): this;
    /**
     * Set the local scale. Supports chaining.
     */
    setLocalScale(scale: Vec3): this;
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
     * Makes world space and local space information have it's own memory
     * allotment as they should be different after calling this method.
     */
    private divideMemory;
    /**
     * Merges local and world space information as they'll be identical.
     */
    private mergeMemory;
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
