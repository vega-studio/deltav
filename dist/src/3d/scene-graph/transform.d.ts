import { Mat4x4, Quaternion, Vec3 } from "../../math";
/**
 * This is a wrapper for a 3D matrix for transforming coordinates from one vector space to another. Follows the order
 * of ISROT: Identity, Scale, Rotation, Origin, Translation. However, this only provides the SRT properties for simpler
 * affine transforms.
 */
export declare class Transform {
    /**
     * Flag indicating this transform has changed properties. Will remain in a changed state until the transform has it's
     * resolve() called.
     */
    readonly changed: boolean;
    private _changed;
    /** Flag that indicates if the transform needs to be updated */
    private needsUpdate;
    /**
     * Flag that indicates this transform has a matrix that performs the operations in reverse (such as for a camera.)
     */
    private hasViewMatrix;
    /**
     * This is the inner matrix that represents the culmination of all the properties into a single transform matrix. It
     * is invalid and will cause undefined behavior if the elements of this matrix are modified. You should use the
     * provided methods of this Transform class to manipulate this matrix.
     */
    readonly matrix: Mat4x4;
    private _matrix;
    /**
     * This is the transform matrix that contains the operations in reverse order. This produces a 'view matrix' for the
     * transform and shouldn't be considered an inverse matrix.
     */
    readonly viewMatrix: Mat4x4;
    private _viewMatrix?;
    /** Orientation of this transform */
    rotation: Quaternion;
    private _rotation;
    private rotationMatrix;
    private needsRotationUpdate;
    /** Scaling transform of this matrix */
    scale: Vec3;
    private _scale;
    private scaleMatrix;
    private needsScaleUpdate;
    /** Translation of this transform */
    position: Vec3;
    private _translation;
    private translationMatrix;
    private needsTranslationUpdate;
    /**
     * Orients this transform to make the forward direction point toward another position.
     */
    lookAt(position: Vec3, up: Vec3): void;
    /**
     * Used by the system to indicate all changes for the transform are resolved, thus putting this transform into a
     * settled state. Unresolved transforms can trigger updates in other parts of the system.
     */
    resolve(): void;
    /**
     * If needed, this updates the matrix for this transform. This is called automatically when the matrix is retrieved.
     */
    update(): void;
}
export declare const IdentityTransform: Readonly<Transform>;
