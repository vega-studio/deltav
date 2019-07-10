import {
  identity4,
  lookAtQuat,
  Mat4x4,
  matrix4x4FromUnitQuat,
  multiply4x4,
  oneQuat,
  Quaternion,
  scale4x4by3,
  subtract3,
  translation4x4by3,
  Vec3
} from "../../math";

/**
 * This is a wrapper for a 3D matrix for transforming coordinates from one vector space to another. Follows the order
 * of ISROT: Identity, Scale, Rotation, Origin, Translation. However, this only provides the SRT properties for simpler
 * affine transforms.
 */
export class Transform {
  /**
   * Flag indicating this transform has changed properties. Will remain in a changed state until the transform has it's
   * resolve() called.
   */
  get changed() {
    return this._changed;
  }
  private _changed: boolean = false;
  /** Flag that indicates if the transform needs to be updated */
  private needsUpdate: boolean = false;

  /**
   * This is the inner matrix that represents the culmination of all the properties into a single transform matrix. It
   * is invalid and will cause undefined behavior if the elements of this matrix are modified. You should use the
   * provided methods of this Transform class to manipulate this matrix.
   */
  get matrix(): Mat4x4 {
    this.update();
    return this._matrix;
  }
  private _matrix: Mat4x4 = identity4();

  /** Orientation of this transform */
  get rotation() {
    return this._rotation;
  }
  set rotation(val: Quaternion) {
    this._rotation = val;
    this.needsUpdate = true;
    this.needsRotationUpdate = true;
    this._changed = true;
  }
  private _rotation: Quaternion = oneQuat();
  private rotationMatrix: Mat4x4 = identity4();
  private needsRotationUpdate: boolean = false;

  /** Scaling transform of this matrix */
  get scale() {
    return this._scale;
  }
  set scale(val: Vec3) {
    this._scale = val;
    this.needsUpdate = true;
    this.needsScaleUpdate = true;
    this._changed = true;
  }
  private _scale: Vec3 = [1, 1, 1];
  private scaleMatrix: Mat4x4 = identity4();
  private needsScaleUpdate = false;

  /** Translation of this transform */
  get position() {
    return this._translation;
  }
  set position(val: Vec3) {
    this._translation = val;
    this.needsUpdate = true;
    this.needsTranslationUpdate = true;
    this._changed = true;
  }
  private _translation: Vec3 = [0, 0, 0];
  private translationMatrix: Mat4x4 = identity4();
  private needsTranslationUpdate: boolean = false;

  /**
   * Orients this transform to make the forward direction point toward another position.
   */
  lookAt(position: Vec3, up: Vec3) {
    this.rotation = lookAtQuat(subtract3(position, this._translation), up);
  }

  /**
   * Used by the system to indicate all changes for the transform are resolved, thus putting this transform into a
   * settled state. Unresolved transforms can trigger updates in other parts of the system.
   */
  resolve() {
    this._changed = false;
  }

  /**
   * If needed, this updates the matrix for this transform. This is called automatically when the matrix is retrieved.
   */
  update() {
    if (!this.needsUpdate) return;

    const S = this.scaleMatrix;

    if (this.needsScaleUpdate) {
      this.needsScaleUpdate = false;
      scale4x4by3(this._scale, S);
    }

    const R = this.rotationMatrix;

    if (this.needsRotationUpdate) {
      matrix4x4FromUnitQuat(this._rotation, R);
    }

    const T = this.translationMatrix;

    if (this.needsTranslationUpdate) {
      this.needsTranslationUpdate = false;
      translation4x4by3(this._translation, T);
    }

    // Concat the SRT transform in this order Scale -> Rotation -> Translation
    // We utilize our existing matrix to reduce redundant allocations of matrix information.
    multiply4x4(T, multiply4x4(R, S, this._matrix), this._matrix);
    this.needsUpdate = false;
  }
}
